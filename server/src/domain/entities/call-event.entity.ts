export interface CallEvent {
  id: string;
  callId: string;
  type: 'start' | 'end' | 'join' | 'leave' | 'mute' | 'unmute' | 'video_on' | 'video_off';
  userId: string;
  data?: Record<string, unknown>;
  timestamp: Date;
} 