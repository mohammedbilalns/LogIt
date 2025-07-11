import { Call } from '../entities/call.entity';
import { IBaseRepository } from './base.repository.interface';
import { CallEvent } from '../entities/call-event.entity';

export interface ICallRepository {
  create(data: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>): Promise<Call>;
  findById(id: string): Promise<Call | null>;
  update(id: string, data: Partial<Call>): Promise<Call | null>;
  findByUser(userId: string, chatId?: string, page?: number, limit?: number): Promise<{
    calls: Call[];
    total: number;
  }>;
  findByChat(chatId: string, page?: number, limit?: number): Promise<{
    calls: Call[];
    total: number;
  }>;
}

export interface ICallEventRepository extends IBaseRepository<CallEvent> {
  findByCallId(callId: string): Promise<CallEvent[]>;
  findByUserId(userId: string, page?: number, limit?: number): Promise<{ events: CallEvent[]; total: number }>;
} 