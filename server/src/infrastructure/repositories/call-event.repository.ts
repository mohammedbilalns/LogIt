import { ICallEventRepository } from '../../domain/repositories/call-event.repository.interface';
import { CallEvent } from '../../domain/entities/call-event.entity';
import CallEventModel, { CallEventDocument } from '../mongodb/call-event.schema';

export class CallEventRepository implements ICallEventRepository {
  async create(data: Omit<CallEvent, 'id' | 'timestamp'>): Promise<CallEvent> {
    const event = new CallEventModel({
      ...data,
      timestamp: new Date(),
    });
    const savedEvent = await event.save();
    return this.mapToCallEvent(savedEvent);
  }

  async findByCallId(callId: string): Promise<CallEvent[]> {
    const events = await CallEventModel.find({ callId })
      .sort({ timestamp: -1 })
      .lean();
    return events.map(event => this.mapToCallEvent(event));
  }

  async findByUser(userId: string, limit: number = 50): Promise<CallEvent[]> {
    const events = await CallEventModel.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return events.map(event => this.mapToCallEvent(event));
  }

  private mapToCallEvent(doc: CallEventDocument): CallEvent {
    const event = doc.toObject();
    return {
      ...event,
      id: event._id.toString(),
    };
  }
} 