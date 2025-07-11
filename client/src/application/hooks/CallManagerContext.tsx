import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/infrastructure/store';
import Peer, { MediaConnection } from 'peerjs';
import { 
  setIncomingCall, 
  startCall,
  endCall,
  emitCallEvent
} from '@/infrastructure/store/slices/callSlice';
import { CallMetadata } from '@/types/call.types';
import { notifications } from '@mantine/notifications';
import { useSocket } from './useSocket';

let globalPeer: Peer | null = null;
let globalPeerUserId: string | null = null;

const CallManagerContext = createContext<any>(null);

export const CallManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { socket } = useSocket();
  const { isInCall, callId, chatId, participants, incomingCall, callType } = useSelector((state: RootState) => state.calls);

  const peerRef = useRef<Peer | null>(null);
  const callsRef = useRef<Map<string, MediaConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const pendingCallsRef = useRef<Map<string, { 
    targetPeerId: string; 
    callType: 'audio' | 'video'; 
    chatId: string;
    incomingCallRef?: { call: any; metadata: any };
  }>>(new Map());
  const acceptedCallsRef = useRef<Set<string>>(new Set());
  const processingAcceptRef = useRef<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [remoteStatus, setRemoteStatus] = useState<{ [userId: string]: { mic: boolean, camera: boolean } }>({});

  // Handle call end
  const handleCallEnd = useCallback((callId: string) => {
    const call = callsRef.current.get(callId);
    if (call) {
      call.close();
      callsRef.current.delete(callId);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStreams({});
    pendingCallsRef.current.delete(callId);
    processingAcceptRef.current.delete(callId);
    dispatch(endCall());
    if (socket && chatId) {
      socket.emit('call:end', { callId, chatId, from: user?._id, fromName: user?.name });
    }
  }, [dispatch, socket, chatId, user?._id, user?.name]);

  const initializePeer = useCallback(() => {
    if (!user?._id) return;
    if (globalPeer && globalPeerUserId === user._id) {
      peerRef.current = globalPeer;
      return;
    }
    if (globalPeer && globalPeerUserId !== user._id) {
      globalPeer.destroy();
      globalPeer = null;
      globalPeerUserId = null;
    }
    const uniquePeerId = `${user._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const peer = new Peer(uniquePeerId, {
      host: import.meta.env.VITE_PEER_HOST || 'localhost',
      port: parseInt(import.meta.env.VITE_PEER_PORT || '9000'),
      path: import.meta.env.VITE_PEER_PATH || '/peerjs',
      secure: import.meta.env.VITE_PEER_SECURE === 'true',
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });
    peer.on('open', (id) => {
      peerRef.current = peer;
      globalPeer = peer;
      globalPeerUserId = user._id;
    });
    peer.on('error', (error) => {
      if (!error.message.includes('ID') || !error.message.includes('taken')) {
        notifications.show({
          title: 'Connection Error',
          message: 'Failed to establish call connection',
          color: 'red',
        });
      }
    });
    peer.on('call', async (incomingCall) => {
      const metadata = incomingCall.metadata as CallMetadata;
      if (isInCall) {
        incomingCall.close();
        return;
      }
      const pendingCall = pendingCallsRef.current.get(metadata.callId);
      if (pendingCall) {
        pendingCallsRef.current.set(metadata.callId, {
          ...pendingCall,
          incomingCallRef: { call: incomingCall, metadata }
        });
        if (acceptedCallsRef.current.has(metadata.callId) && localStreamRef.current) {
          incomingCall.answer(localStreamRef.current);
          incomingCall.on('stream', (remoteStream) => {
            setRemoteStreams(prev => ({ ...prev, [metadata.from]: remoteStream }));
          });
          incomingCall.on('close', () => { handleCallEnd(metadata.callId); });
          callsRef.current.set(metadata.callId, incomingCall);
        }
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: metadata.type === 'video',
            audio: true,
          });
          localStreamRef.current = stream;
          setLocalStream(stream);
          incomingCall.answer(stream);
          incomingCall.on('stream', (remoteStream) => {
            setRemoteStreams(prev => ({ ...prev, [metadata.from]: remoteStream }));
          });
          incomingCall.on('close', () => { handleCallEnd(metadata.callId); });
          callsRef.current.set(metadata.callId, incomingCall);
          dispatch(startCall({
            callId: metadata.callId,
            chatId: metadata.chatId,
            type: metadata.type,
            participants: [user?._id || '', metadata.from]
          }));
        } catch (error) {
          incomingCall.close();
        }
      }
    });
    globalPeer = peer;
    globalPeerUserId = user._id;
    peerRef.current = peer;
  }, [user?._id, isInCall, dispatch, socket, handleCallEnd]);

  useEffect(() => { initializePeer(); }, [user?._id]);
  useEffect(() => {
    if (socket && peerRef.current && user?._id) {
      socket.emit('peer:register', { peerId: peerRef.current.id, userId: user._id });
    }
  }, [socket, user?._id]);
  useEffect(() => {
    if (socket && socket.connected && peerRef.current && user?._id) {
      const timeoutId = setTimeout(() => {
        socket.emit('peer:register', { peerId: peerRef.current?.id, userId: user._id });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [socket?.connected, user?._id]);
  useEffect(() => {
    return () => {
      if (!user?._id && globalPeer) {
        globalPeer.destroy();
        globalPeer = null;
        globalPeerUserId = null;
      }
    };
  }, [user?._id]);

  useEffect(() => {
    if (!socket) return;
    socket.on('call:request', async (data: { 
      callId: string; 
      from: string; 
      fromName: string; 
      chatId: string; 
      type: 'audio' | 'video';
      fromPeerId: string;
    }) => {
      if (incomingCall?.id === data.callId) return;
      if (isInCall) {
        socket.emit('call:reject', { callId: data.callId, from: user?._id });
        return;
      }
      dispatch(setIncomingCall({
        id: data.callId,
        from: data.from,
        fromName: data.fromName,
        chatId: data.chatId,
        type: data.type,
        timestamp: new Date(),
      }));
      pendingCallsRef.current.set(data.callId, {
        targetPeerId: data.fromPeerId,
        callType: data.type,
        chatId: data.chatId
      });
      setTimeout(() => { acceptCall(); }, 500); // auto-accept for debug
    });
    socket.on('call:accepted', async (data: { 
      callId: string; 
      from: string; 
      fromPeerId: string;
    }) => {
      if (processingAcceptRef.current.has(data.callId)) return;
      processingAcceptRef.current.add(data.callId);
      const pendingCall = pendingCallsRef.current.get(data.callId);
      if (!pendingCall || !peerRef.current) {
        processingAcceptRef.current.delete(data.callId);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: pendingCall.callType === 'video',
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        const call = peerRef.current.call(data.fromPeerId, stream, {
          metadata: {
            type: pendingCall.callType,
            chatId: pendingCall.chatId,
            from: user?._id,
            fromName: user?.name,
            callId: data.callId,
          } as CallMetadata,
        });
        call.on('stream', (remoteStream) => {
          setRemoteStreams(prev => ({ ...prev, [data.from]: remoteStream }));
        });
        call.on('close', () => { handleCallEnd(data.callId); });
        call.on('error', () => { handleCallEnd(data.callId); });
        callsRef.current.set(data.callId, call);
        pendingCallsRef.current.delete(data.callId);
        dispatch(startCall({
          callId: data.callId,
          chatId: pendingCall.chatId,
          type: pendingCall.callType,
          participants: [user?._id || '', data.from]
        }));
      } catch (error) {
        notifications.show({
          title: 'Call Error',
          message: 'Failed to start call. Please check your camera and microphone permissions.',
          color: 'red',
        });
      } finally {
        processingAcceptRef.current.delete(data.callId);
      }
    });
    socket.on('call:rejected', (data: { callId: string }) => {
      pendingCallsRef.current.delete(data.callId);
      notifications.show({
        title: 'Call Rejected',
        message: 'The call was rejected by the other user.',
        color: 'yellow',
      });
    });
    socket.on('call:ended', (data: { callId: string }) => {
      handleCallEnd(data.callId);
    });
    return () => {
      socket.off('call:request');
      socket.off('call:accepted');
      socket.off('call:rejected');
      socket.off('call:ended');
    };
  }, [socket, isInCall, dispatch, user?._id, handleCallEnd]);

  const initiateCall = useCallback(async (
    targetUserId: string, 
    callType: 'audio' | 'video',
    chatId: string,
    callId: string
  ) => {
    if (!peerRef.current || isInCall) return;
    const pendingCallInfo = {
      targetPeerId: targetUserId,
      callType,
      chatId
    };
    pendingCallsRef.current.set(callId, pendingCallInfo);
    if (socket) {
      const callRequest = { 
        callId, 
        chatId, 
        from: user?._id, 
        fromName: user?.name, // Add caller's name
        to: targetUserId,
        type: callType,
        fromPeerId: peerRef.current.id
      };
      socket.emit('call:request', callRequest);
    }
    notifications.show({
      title: 'Calling...',
      message: 'Connecting to the other user...',
      color: 'blue',
    });
  }, [peerRef, isInCall, dispatch, user, socket]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socket || !peerRef.current) return;
    if (processingAcceptRef.current.has(incomingCall.id)) return;
    processingAcceptRef.current.add(incomingCall.id);
    acceptedCallsRef.current.add(incomingCall.id);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.type === 'video',
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      const pendingCall = pendingCallsRef.current.get(incomingCall.id);
      if (!pendingCall) return;
      socket.emit('call:accept', { 
        callId: incomingCall.id, 
        from: user?._id,
        fromPeerId: peerRef.current.id
      });
      const waitForIncomingCallRef = async () => {
        let attempts = 0;
        while (!pendingCallsRef.current.get(incomingCall.id)?.incomingCallRef && attempts < 20) {
          await new Promise(res => setTimeout(res, 100));
          attempts++;
        }
        return pendingCallsRef.current.get(incomingCall.id)?.incomingCallRef;
      };
      let incomingCallRef = pendingCall.incomingCallRef;
      if (!incomingCallRef) {
        incomingCallRef = await waitForIncomingCallRef();
      }
      if (incomingCallRef) {
        const { call } = incomingCallRef;
        call.answer(stream);
        call.on('stream', (remoteStream: MediaStream) => {
          setRemoteStreams(prev => ({ ...prev, [incomingCall.from]: remoteStream }));
        });
        call.on('close', () => { handleCallEnd(incomingCall.id); });
        callsRef.current.set(incomingCall.id, call);
        pendingCallsRef.current.delete(incomingCall.id);
        acceptedCallsRef.current.delete(incomingCall.id);
      }
      dispatch(startCall({
        callId: incomingCall.id,
        chatId: incomingCall.chatId,
        type: incomingCall.type,
        participants: [user?._id || '', incomingCall.from]
      }));
      dispatch(setIncomingCall(null));
    } catch (error) {
      notifications.show({
        title: 'Call Error',
        message: 'Failed to accept call. Please check your camera and microphone permissions.',
        color: 'red',
      });
    } finally {
      processingAcceptRef.current.delete(incomingCall.id);
    }
  }, [dispatch, socket, user?._id, incomingCall, handleCallEnd]);

  const rejectCall = useCallback(() => {
    if (!incomingCall || !socket) return;
    socket.emit('call:reject', { 
      callId: incomingCall.id, 
      from: user?._id 
    });
    dispatch(setIncomingCall(null));
  }, [dispatch, socket, user?._id, incomingCall]);

  const endCurrentCall = useCallback(() => {
    if (!socket || !isInCall || !callId || !chatId || !user?._id) return;
    socket.emit('call:end', { callId, chatId, from: user._id, fromName: user?.name });
    handleCallEnd(callId);
  }, [socket, isInCall, callId, chatId, user?._id, user?.name, handleCallEnd]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const newMuted = audioTracks.length > 0 ? audioTracks.every((track: MediaStreamTrack) => !track.enabled) : false;
      audioTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });
      // After toggling, check again
      const nowMuted = audioTracks.length > 0 ? audioTracks.every((track: MediaStreamTrack) => !track.enabled) : false;
      setIsMuted(nowMuted);
      // Emit status update
      if (socket && callId && chatId && user?._id) {
        socket.emit('call:status-update', {
          callId,
          chatId,
          userId: user._id,
          mic: !nowMuted,
          camera: isVideoEnabled,
        });
      }
    }
  }, [socket, callId, chatId, user?._id, isVideoEnabled]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const newEnabled = videoTracks.length > 0 ? videoTracks.some((track: MediaStreamTrack) => track.enabled) : false;
      videoTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });
      // After toggling, check again
      const nowEnabled = videoTracks.length > 0 ? videoTracks.some((track: MediaStreamTrack) => track.enabled) : false;
      setIsVideoEnabled(nowEnabled);
      // Emit status update
      if (socket && callId && chatId && user?._id) {
        socket.emit('call:status-update', {
          callId,
          chatId,
          userId: user._id,
          mic: !isMuted,
          camera: nowEnabled,
        });
      }
    }
  }, [socket, callId, chatId, user?._id, isMuted]);

  // Listen for remote status updates
  useEffect(() => {
    if (!socket) return;
    const handler = (data: { userId: string; mic: boolean; camera: boolean }) => {
      setRemoteStatus(prev => ({
        ...prev,
        [data.userId]: { mic: data.mic, camera: data.camera }
      }));
    };
    socket.on('call:status-update', handler);
    return () => socket.off('call:status-update', handler);
  }, [socket]);

  const contextValue = {
    startCall: initiateCall,
    acceptCall,
    rejectCall,
    endCurrentCall,
    toggleMute,
    toggleVideo,
    isInCall,
    callType,
    localStream,
    remoteStreams,
    isMuted,
    isVideoEnabled,
    remoteStatus,
    peer: peerRef.current,
  };

  return (
    <CallManagerContext.Provider value={contextValue}>
      {children}
    </CallManagerContext.Provider>
  );
};

export const useCallManagerContext = () => {
  const ctx = useContext(CallManagerContext);
  if (!ctx) throw new Error('useCallManagerContext must be used within CallManagerProvider');
  return ctx;
}; 