import ChatActionLogModel, { ChatActionLogDocument } from '../mongodb/chat-action-log.schema';
import { ChatActionLog } from '../../domain/entities/chat-action-log.entity';
import { Types } from 'mongoose';

export class ChatActionLogRepository {
  async createLog(log: Omit<ChatActionLog, 'id' | 'createdAt'> & { createdAt?: Date }): Promise<ChatActionLog> {
    const doc = await ChatActionLogModel.create(log) as ChatActionLogDocument;
    return {
      id: (doc._id as Types.ObjectId).toString(),
      chatId: doc.chatId,
      actionBy: doc.actionBy,
      action: doc.action,
      targetUser: doc.targetUser,
      message: doc.message,
      createdAt: doc.createdAt,
    };
  }

  async getLastRemovalOrLeaveLog(chatId: string, userId: string): Promise<ChatActionLog | null> {
    const doc = await ChatActionLogModel.findOne({
      chatId,
      targetUser: userId,
      action: { $in: ['removed', 'left'] },
    }).sort({ createdAt: -1 });
    if (!doc) return null;
    return {
      id: (doc._id as Types.ObjectId).toString(),
      chatId: doc.chatId,
      actionBy: doc.actionBy,
      action: doc.action,
      targetUser: doc.targetUser,
      message: doc.message,
      createdAt: doc.createdAt,
    };
  }
} 