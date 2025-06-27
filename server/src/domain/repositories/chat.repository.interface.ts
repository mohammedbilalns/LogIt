import { Chat } from "../entities/chat.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface ChatWithDetails extends Chat {
  participants: Array<{
    id: string;
    userId: string;
    name: string;
    profileImage?: string;
    role: string;
  }>;
  lastMessageDetails?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: Date;
  };
  unreadCount?: number;
}

export interface IChatRepository extends IBaseRepository<Chat> {
  findUserChats(userId: string, page?: number, limit?: number, filterIsGroup?: boolean): Promise<{ data: ChatWithDetails[]; total: number }>;
  findPrivateChat(userId1: string, userId2: string): Promise<Chat | null>;
  findChatWithDetailsById(chatId: string): Promise<ChatWithDetails | null>;
} 