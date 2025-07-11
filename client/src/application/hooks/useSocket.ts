import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/infrastructure/store';
import {
  addMessage,
  addNewChat,
  setSocketConnected,
} from '@/infrastructure/store/slices/chatSlice';
import { setIncomingCall } from '@/infrastructure/store/slices/callSlice';

export const useSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { socketConnected } = useSelector((state: RootState) => state.chat);
  const socket = typeof window !== 'undefined' ? (window as any).globalSocket : null;

  useEffect(() => {
    if (!socket) return;
    const handleConnect = () => {
      dispatch(setSocketConnected(true));
    };
    const handleDisconnect = () => {
      dispatch(setSocketConnected(false));
    };
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    if (socket.connected) dispatch(setSocketConnected(true));
    else dispatch(setSocketConnected(false));
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, dispatch]);

  // Callbacks for group events
  const groupEventCallbacks = useRef<{
    onUserRemoved?: (data: { chatId: string; message: string }) => void;
    onUserLeft?: (data: { chatId: string; message: string }) => void;
    onParticipantRemoved?: (data: {
      chatId: string;
      removedUserId: string;
      removedBy: string;
    }) => void;
    onParticipantLeft?: (data: { chatId: string; leftUserId: string }) => void;
  }>({});

  useEffect(() => {
    if (!user?._id || !socket) return;

    // Chat events
    socket.on('new_message', (message: any) => {
      dispatch(addMessage(message));
    });
    socket.on('new_chat', (chat: any) => {
      dispatch(addNewChat(chat));
    });
    socket.on('new_group_chat', (chat: any) => {
      dispatch(addNewChat(chat));
    });
    // Group management events
    socket.on('user_removed_from_group', (data: any) => {
      groupEventCallbacks.current.onUserRemoved?.(data);
    });
    socket.on('user_left_group', (data: any) => {
      groupEventCallbacks.current.onUserLeft?.(data);
    });
    socket.on('participant_removed', (data: any) => {
      groupEventCallbacks.current.onParticipantRemoved?.(data);
    });
    socket.on('participant_left', (data: any) => {
      groupEventCallbacks.current.onParticipantLeft?.(data);
    });
    socket.on('force_leave_chat_room', (chatId: string) => {
      socket.emit('force_leave_chat_room', chatId);
    });

    // Call events
    socket.on('call:start', (data: any) => {
      if (data.to === user?._id) {
        dispatch(setIncomingCall({
          id: data.callId,
          from: data.from,
          fromName: data.fromName || 'Unknown',
          chatId: data.chatId,
          type: data.type,
          timestamp: new Date(),
        }));
      }
    });

    socket.on('call:end', (data: any) => {
      console.log('Call ended:', data);
    });

    // Cleanup listeners on unmount
    return () => {
      if (socket) {
        socket.off('new_message');
        socket.off('new_chat');
        socket.off('new_group_chat');
        socket.off('user_removed_from_group');
        socket.off('user_left_group');
        socket.off('participant_removed');
        socket.off('participant_left');
        socket.off('force_leave_chat_room');
        socket.off('call:start');
        socket.off('call:end');
      }
    };
  }, [user?._id, dispatch, socket]);

  const joinChatRoom = useCallback(
    (chatId: string) => {
      if (socket && socket.connected) {
        socket.emit('join_chat_room', chatId);
      }
    },
    [socket]
  );

  const leaveChatRoom = useCallback(
    (chatId: string) => {
      if (socket && socket.connected) {
        socket.emit('leave_chat_room', chatId);
      }
    },
    [socket]
  );

  // Subscribe to user online/offline events
  const subscribeToUserStatus = useCallback(
    (
      onOnline: (data: { userId: string }) => void,
      onOffline: (data: { userId: string }) => void
    ) => {
      if (!socket) return;
      socket.on('user_online', onOnline);
      socket.on('user_offline', onOffline);
      return () => {
        socket?.off('user_online', onOnline);
        socket?.off('user_offline', onOffline);
      };
    },
    [socket]
  );

  // Subscribe to group events
  const subscribeToGroupEvents = useCallback(
    (callbacks: {
      onUserRemoved?: (data: { chatId: string; message: string }) => void;
      onUserLeft?: (data: { chatId: string; message: string }) => void;
      onParticipantRemoved?: (data: {
        chatId: string;
        removedUserId: string;
        removedBy: string;
      }) => void;
      onParticipantLeft?: (data: { chatId: string; leftUserId: string }) => void;
    }) => {
      groupEventCallbacks.current = callbacks;
      return () => {
        groupEventCallbacks.current = {};
      };
    },
    []
  );

  return {
    socket,
    socketConnected,
    joinChatRoom,
    leaveChatRoom,
    subscribeToUserStatus,
    subscribeToGroupEvents,
  };
};
