import { BaseEntity } from './base.entity';

export interface Call {
  id: string;
  type: 'audio' | 'video';
  chatId: string;
  participants: string[];
  startedAt: Date;
  endedAt?: Date;
  endedBy?: string;
  status: 'active' | 'ended' | 'missed';
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallEvent extends BaseEntity {
  type: 'incoming' | 'accepted' | 'rejected' | 'ended' | 'missed';
  callId: string;
  chatId: string;
  from: string;
  to: string;
  callType: 'audio' | 'video';
  timestamp: Date;
} 