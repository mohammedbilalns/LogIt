import { ChatActionLog } from "../entities/chat-action-log.entity";
 
export interface IChatActionLogRepository {
  createLog(log: Omit<ChatActionLog, 'id' | 'createdAt'> & { createdAt?: Date }): Promise<ChatActionLog>;
  getLastRemovalOrLeaveLog(chatId: string, userId: string): Promise<ChatActionLog | null>;
} 