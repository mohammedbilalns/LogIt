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
  fetchChatMessages,
} from '@/store/slices/chatSlice';

export function useChat(id?: string) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = false; // You can add useMediaQuery if needed
  const { user: loggedInUser } = useSelector((state: RootState) => state.auth);
  const { currentChat, messages, participants, loading, messagesLoading, error, socketConnected } =
    useSelector((state: RootState) => state.chat);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerClassName = `page-container ${isSidebarOpen ? 'sidebar-open' : ''}`;
  const [isOnline, setIsOnline] = useState(false);
  const { socket, joinChatRoom, leaveChatRoom, subscribeToUserStatus } = useSocket();
  const page = useSelector((state: RootState) => state.chat.page);
  const hasMore = useSelector((state: RootState) => state.chat.hasMore);
  const limit = useSelector((state: RootState) => state.chat.limit);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const chatName = useMemo(() => {
    if (!currentChat) return 'Loading...';
    if (currentChat.isGroup) {
      return currentChat.name || 'Group Chat';
    }
    const otherParticipant = participants.find((p) => p.userId !== loggedInUser?._id);
    return otherParticipant ? otherParticipant.name : 'Private Chat';
  }, [currentChat, participants, loggedInUser?._id]);

  const avatarInitials = useMemo(() => getInitials(chatName), [chatName]);
  const otherParticipant = useMemo(
    () => participants.find((p) => p.userId !== loggedInUser?._id),
    [participants, loggedInUser?._id]
  );

  useEffect(() => {
    if (id && socketConnected) {
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

  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    if (id) {
      dispatch(fetchChatDetails(id));
    }
  }, [id, dispatch]);

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

  // Fetch initial messages
  useEffect(() => {
    if (id) {
      dispatch(fetchChatMessages({ chatId: id, page: 1, limit }));
    }
  }, [id, dispatch, limit]);

  // Fetch previous messages (older)
  const fetchPreviousMessages = async () => {
    if (!id || !hasMore) return;
    // 1. Record scrollHeight and scrollTop before fetch
    const container = messagesContainerRef.current;
    const prevScrollHeight = container ? container.scrollHeight : 0;
    const prevScrollTop = container ? container.scrollTop : 0;
    await dispatch(fetchChatMessages({ chatId: id, page: page + 1, limit }));
    setShouldScrollToBottom(false); // Do not scroll to bottom when loading older messages
    // 2. After DOM updates, restore scroll position
    requestAnimationFrame(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
      }
    });
  };

  const handleSend = async () => {
    if (!message.trim() || !id || sending) return;
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
    limit,
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
