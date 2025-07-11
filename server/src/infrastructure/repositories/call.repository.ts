import { ICallRepository } from '../../domain/repositories/call.repository.interface';
import { Call } from '../../domain/entities/call.entity';
import CallModel, { CallDocument } from '../mongodb/call.schema';

export class CallRepository implements ICallRepository {
  async create(data: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>): Promise<Call> {
    const call = new CallModel(data);
    const savedCall = await call.save();
    return this.mapToCallLog(savedCall);
  }

  async findById(id: string): Promise<Call | null> {
    const call = await CallModel.findById(id);
    return call ? this.mapToCallLog(call) : null;
  }

  async update(id: string, data: Partial<Call>): Promise<Call | null> {
    const call = await CallModel.findByIdAndUpdate(id, data, { new: true });
    return call ? this.mapToCallLog(call) : null;
  }

  async findByUser(userId: string, chatId?: string, page: number = 1, limit: number = 20): Promise<{
    calls: Call[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { participants: userId };
    
    if (chatId) {
      query.chatId = chatId;
    }

    const [calls, total] = await Promise.all([
      CallModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CallModel.countDocuments(query)
    ]);

    return {
      calls: calls.map(call => this.mapToCallLog(call)),
      total
    };
  }

  async findByChat(chatId: string, page: number = 1, limit: number = 20): Promise<{
    calls: Call[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [calls, total] = await Promise.all([
      CallModel.find({ chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CallModel.countDocuments({ chatId })
    ]);

    return {
      calls: calls.map(call => this.mapToCallLog(call)),
      total
    };
  }

  private mapToCallLog(doc: CallDocument): Call {
    const call = doc.toObject();
    return {
      ...call,
      id: call._id.toString(),
    };
  }
} 