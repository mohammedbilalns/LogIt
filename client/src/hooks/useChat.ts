import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/hooks/useSocket';
import { AppDispatch, RootState } from '@/store';
import {
  clearMessages,
  fetchChatDetails,
  sendMessage,
  setCurrentChat,
  handleUserRemoved,
  handleUserLeft,
} from '@/store/slices/chatSlice';
import { notifications } from '@mantine/notifications';

export function useChat(id?: string) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = false;
  const { user: loggedInUser } = useSelector((state: RootState) => state.auth);
  const { currentChat, messages, participants, loading, messagesLoading, error, socketConnected } =
    useSelector((state: RootState) => state.chat);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerClassName = `page-container ${isSidebarOpen ? 'sidebar-open' : ''}`;
  const [isOnline, setIsOnline] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const { socket, joinChatRoom, leaveChatRoom, subscribeToUserStatus, subscribeToGroupEvents } = useSocket();
  const page = useSelector((state: RootState) => state.chat.page);
  const hasMore = useSelector((state: RootState) => state.chat.hasMore);
  const limit = useSelector((state: RootState) => state.chat.limit);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const groupChats = useSelector((state: RootState) => state.chat.groupChats);
  const singleChats = useSelector((state: RootState) => state.chat.singleChats);

  const chatName = useMemo(() => {
    if (!currentChat) {
      // Try to get chat info from the chat lists as fallback
      const groupChat = groupChats.find(c => c.id === id);
      const singleChat = singleChats.find(c => c.id === id);
      const fallbackChat = groupChat || singleChat;
      
      if (fallbackChat) {
        if (fallbackChat.isGroup) {
          return fallbackChat.name || 'Group Chat';
        } else {
          const otherParticipant = fallbackChat.participants?.find((p: any) => p.userId !== loggedInUser?._id);
          return otherParticipant?.name || 'Private Chat';
        }
      }
      return 'Loading...';
    }
    
    if (currentChat.isGroup) {
      return currentChat.name || 'Group Chat';
    }
    const otherParticipant = participants.find((p) => p.userId !== loggedInUser?._id);
    return otherParticipant ? otherParticipant.name : 'Private Chat';
  }, [currentChat, participants, loggedInUser?._id, id, groupChats, singleChats]);

  const avatarInitials = useMemo(() => getInitials(chatName), [chatName]);
  const otherParticipant = useMemo(
    () => participants.find((p) => p.userId !== loggedInUser?._id),
    [participants, loggedInUser?._id]
  );

  // Check if current user is removed or left the group
  const myParticipant = useMemo(() => 
    participants.find((p) => p.userId === loggedInUser?._id),
    [participants, loggedInUser?._id]
  );
  const isRemovedOrLeft = myParticipant?.role === 'removed-user' || myParticipant?.role === 'left-user';

  useEffect(() => {
    if (id && socketConnected && !isRemovedOrLeft) {
      joinChatRoom(id);
    }
    return () => {
      if (id && socketConnected) {
        leaveChatRoom(id);
      }
      dispatch(clearMessages());
      dispatch(setCurrentChat(null));
    };
  }, [id, socketConnected, joinChatRoom, leaveChatRoom, dispatch]);

  // Subscribe to group events
  useEffect(() => {
    if (!socket || !socket.connected) return;

    const unsubscribe = subscribeToGroupEvents({
      onUserRemoved: (data) => {
        if (data.chatId === id) {
          notifications.show({
            title: 'Removed from Group',
            message: data.message,
            color: 'red',
          });
      
        }
      },
      onUserLeft: (data) => {
        if (data.chatId === id) {
          notifications.show({
            title: 'Left Group',
            message: data.message,
            color: 'blue',
          });

        }
      },
      onParticipantRemoved: (data) => {
        if (data.chatId === id) {
          dispatch(handleUserRemoved({ chatId: data.chatId, removedUserId: data.removedUserId }));
          dispatch(fetchChatDetails({ chatId: id, page: 1, limit }));
        }
      },
      onParticipantLeft: (data) => {
        if (data.chatId === id) {
          dispatch(handleUserLeft({ chatId: data.chatId, leftUserId: data.leftUserId }));
          // Refresh chat details to update participant list
          dispatch(fetchChatDetails({ chatId: id, page: 1, limit }));
        }
      },
    });

    return unsubscribe;
  }, [socket, socket?.connected, subscribeToGroupEvents, id, dispatch, navigate, limit]);

  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    if (id) {
      dispatch(fetchChatDetails({ chatId: id, page: 1, limit })).catch((error) => {
        console.error('Failed to fetch chat details:', error);
      });
    }
  }, [id, dispatch, limit]);

  useEffect(() => {
    if (otherParticipant?.userId) {
      fetch(`/api/user/online/${otherParticipant.userId}`)
        .then((res) => res.json())
        .then((data) => setIsOnline(data.online));
    }
  }, [otherParticipant?.userId]);

  useEffect(() => {
    if (otherParticipant?.userId && socket && socket.connected) {
      socket.emit(
        'check_online_status',
        { userIds: [otherParticipant.userId] },
        (status: Record<string, boolean>) => {
          setIsOnline(status[otherParticipant.userId]);
        }
      );
    }
  }, [otherParticipant?.userId, socket, socket?.connected]);

  useEffect(() => {
    if (!otherParticipant?.userId) return;
    const handleOnline = ({ userId }: { userId: string }) => {
      if (userId === otherParticipant.userId) setIsOnline(true);
    };
    const handleOffline = ({ userId }: { userId: string }) => {
      if (userId === otherParticipant.userId) setIsOnline(false);
    };
    const unsubscribe = subscribeToUserStatus(handleOnline, handleOffline);
    return unsubscribe;
  }, [otherParticipant?.userId, subscribeToUserStatus]);

  useEffect(() => {
    if (!currentChat?.isGroup || !participants.length || !socket || !socket.connected || isRemovedOrLeft) {
      setOnlineCount(0);
      return;
    }
    const userIds = participants
      .map((p) => p.userId)
      .filter((uid) => uid && uid !== loggedInUser?._id);
    if (userIds.length === 0) {
      setOnlineCount(1); // Only self
      return;
    }
    const updateOnlineCount = () => {
      socket.emit('check_online_status', { userIds }, (status: Record<string, boolean>) => {
        let count = 0;
        for (const uid of userIds) {
          if (status[uid]) count++;
        }
        if (loggedInUser?._id && socket.connected) count++;
        setOnlineCount(count);
      });
    };
    updateOnlineCount();
    const handleOnline = () => updateOnlineCount();
    const handleOffline = () => updateOnlineCount();
    socket.on('user_online', handleOnline);
    socket.on('user_offline', handleOffline);
    return () => {
      socket.off('user_online', handleOnline);
      socket.off('user_offline', handleOffline);
    };
  }, [currentChat?.isGroup, participants, socket, socket?.connected, loggedInUser?._id, isRemovedOrLeft]);

  const fetchPreviousMessages = async () => {
    if (!id || !hasMore) return;
    const container = messagesContainerRef.current;
    const prevScrollHeight = container ? container.scrollHeight : 0;
    const prevScrollTop = container ? container.scrollTop : 0;
    await dispatch(fetchChatDetails({ chatId: id, page: page + 1, limit }));
    setShouldScrollToBottom(false);
    requestAnimationFrame(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
      }
    });
  };

  const handleSend = async () => {
    if (!message.trim() || !id || sending || isRemovedOrLeft) return;
    setSending(true);
    try {
      await dispatch(sendMessage({ chatId: id, content: message.trim() })).unwrap();
      setMessage('');
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  return {
    id,
    currentChat,
    messages,
    participants,
    loading,
    messagesLoading,
    error,
    socketConnected,
    isSidebarOpen,
    isMobile,
    chatName,
    avatarInitials,
    otherParticipant,
    isOnline,
    onlineCount,
    message,
    setMessage,
    sending,
    handleSend,
    handleProfileClick,
    messagesEndRef,
    containerClassName,
    loggedInUser,
    hasMore,
    fetchPreviousMessages,
    page,
    messagesContainerRef,
    isRemovedOrLeft,
    myParticipant,
  };
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function formatMessageTime(timestamp: string) {
  try {
    return format(new Date(timestamp), 'HH:mm');
  } catch {
    return 'Now';
  }
}
