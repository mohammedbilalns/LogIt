export interface CallState {
  isInCall: boolean;
  isCallActive: boolean;
  callType: 'audio' | 'video' | null;
  callId: string | null;
  chatId: string | null;
  participants: string[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  incomingCall: IncomingCall | null;
  callHistory: CallLog[];
  loading: boolean;
  error: string | null;
}

export interface IncomingCall {
  id: string;
  from: string;
  fromName: string;
  chatId: string;
  type: 'audio' | 'video';
  timestamp: Date;
}

export interface CallLog {
  id: string;
  type: 'audio' | 'video';
  chatId: string;
  participants: string[];
  startedAt: Date;
  endedAt: Date | null;
  endedBy: string | null;
  status: 'ended' | 'missed' | 'rejected' | 'ongoing';
  duration: number; // in seconds
}

export interface CallMetadata {
  type: 'audio' | 'video';
  chatId: string;
  from: string;
  fromName: string;
  callId: string;
}

export interface CallEvent {
  type: 'incoming' | 'accepted' | 'rejected' | 'ended' | 'missed';
  callId: string;
  chatId: string;
  from: string;
  to: string;
  callType: 'audio' | 'video';
  timestamp: Date;
}

export interface CallControls {
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  switchCamera: () => void;
  endCall: () => void;
  acceptCall: () => void;
  rejectCall: () => void;
} 