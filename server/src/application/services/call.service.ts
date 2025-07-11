import { Server } from 'socket.io';
import { ICallService, CreateCallLogData, UpdateCallLogData, CallHistoryResult } from '../../domain/services/call.service.interface';
import { Call } from '../../domain/entities/call.entity';
import { CallEvent } from '../../domain/entities/call-event.entity';
import { ICallRepository } from '../../domain/repositories/call.repository.interface';
import { ICallEventRepository } from '../../domain/repositories/call-event.repository.interface';

export class CallService implements ICallService {
  constructor(
    private callRepository: ICallRepository,
    private callEventRepository: ICallEventRepository,
    private io: Server
  ) {}

  async createCallLog(data: CreateCallLogData): Promise<Call> {
    const call = await this.callRepository.create({
      ...data,
      startedAt: new Date(),
      status: 'active',
    });

    // Emit call start event to all participants
    data.participants.forEach(participantId => {
      this.io.to(participantId).emit('call:started', {
        callId: call.id,
        type: call.type,
        chatId: call.chatId,
        participants: call.participants,
        startedAt: call.startedAt,
      });
    });

    return call;
  }

  async updateCallLog(callId: string, data: UpdateCallLogData): Promise<Call | null> {
    const call = await this.callRepository.update(callId, data);

    if (call) {
      // Emit call update event to all participants
      call.participants.forEach(participantId => {
        this.io.to(participantId).emit('call:updated', {
          callId: call.id,
          status: call.status,
          endedAt: call.endedAt,
          endedBy: call.endedBy,
          duration: call.duration,
        });
      });
    }

    return call;
  }

  async getCallHistory(userId: string, chatId?: string, page: number = 1, limit: number = 20): Promise<CallHistoryResult> {
    const result = await this.callRepository.findByUser(userId, chatId, page, limit);
    
    return {
      calls: result.calls,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async emitCallEvent(event: Omit<CallEvent, 'id' | 'timestamp'>): Promise<void> {
    const savedEvent = await this.callEventRepository.create(event);

    const call = await this.callRepository.findById(event.callId);
    if (call) {
      call.participants.forEach(participantId => {
        this.io.to(participantId).emit('call:event', {
          ...savedEvent,
          callId: event.callId,
        });
      });
    }
  }
} 