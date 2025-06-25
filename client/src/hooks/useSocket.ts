import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState, AppDispatch } from '@/store';
import { setSocketConnected, addMessage } from '@/store/slices/chatSlice';

export const useSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { socketConnected } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    if (!user?._id) return;

    // Clean up existing connection if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Initialize socket connection
    socketRef.current = io('http://localhost:3000', {
      withCredentials: true,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      dispatch(setSocketConnected(true));
      
      // Join user room for notifications
      socket.emit('join_user_room', user._id);
      // Identify user for online status tracking
      socket.emit('identify', user._id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      dispatch(setSocketConnected(false));
    });

    // Chat events
    socket.on('new_message', (message) => {
      console.log('New message received:', message);
      dispatch(addMessage(message));
    });

    socket.on('new_chat', (chat) => {
      console.log('New chat created:', chat);
      // You can dispatch an action to add the chat to the list if needed
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id, dispatch]);

  const joinChatRoom = useCallback((chatId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_chat_room', chatId);
      console.log('Joined chat room:', chatId);
    }
  }, []);

  const leaveChatRoom = useCallback((chatId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave_chat_room', chatId);
      console.log('Left chat room:', chatId);
    }
  }, []);

  // Subscribe to user online/offline events
  const subscribeToUserStatus = useCallback((
    onOnline: (data: { userId: string }) => void,
    onOffline: (data: { userId: string }) => void
  ) => {
    if (!socketRef.current) return;
    socketRef.current.on('user_online', onOnline);
    socketRef.current.on('user_offline', onOffline);
    return () => {
      socketRef.current?.off('user_online', onOnline);
      socketRef.current?.off('user_offline', onOffline);
    };
  }, []);

  return {
    socket: socketRef.current,
    socketConnected,
    joinChatRoom,
    leaveChatRoom,
    subscribeToUserStatus,
  };
}; 