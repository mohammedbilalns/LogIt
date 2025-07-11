import { Call } from '../entities/call.entity';
import { CallEvent } from '../entities/call-event.entity';

export interface CreateCallLogData {
  type: 'audio' | 'video';
  chatId: string;
  participants: string[];
}

export interface UpdateCallLogData {
  endedAt?: Date;
  endedBy?: string;
  status?: 'active' | 'ended' | 'missed';
  duration?: number;
}

export interface CallHistoryResult {
  calls: Call[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICallService {
  createCallLog(data: CreateCallLogData): Promise<Call>;
  updateCallLog(callId: string, data: UpdateCallLogData): Promise<Call | null>;
  getCallHistory(userId: string, chatId?: string, page?: number, limit?: number): Promise<CallHistoryResult>;
  emitCallEvent(event: Omit<CallEvent, 'id' | 'timestamp'>): Promise<void>;
} 