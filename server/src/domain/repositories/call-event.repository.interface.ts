import { CallEvent } from '../entities/call-event.entity';
 
export interface ICallEventRepository {
  create(data: Omit<CallEvent, 'id' | 'timestamp'>): Promise<CallEvent>;
  findByCallId(callId: string): Promise<CallEvent[]>;
  findByUser(userId: string, limit?: number): Promise<CallEvent[]>;
} 