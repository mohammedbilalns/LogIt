import { Chat } from "../entities/chat.entity";
import { CreateChatDto, CreateGroupChatDto, SendMessageDto } from "../../application/dtos/chat.dto";
import { ChatParticipants } from "../entities/chat-participants";
import { Message } from "../entities/message.entity";

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

export interface IChatService {
  createChat(creatorId: string, data: CreateChatDto): Promise<Chat>;
  createGroupChat(creatorId: string, data: CreateGroupChatDto): Promise<Chat>;
  getUserChats(userId: string, page?: number, limit?: number): Promise<{ data: ChatWithDetails[]; total: number; page: number; limit: number; hasMore: boolean }>;
  getChatDetails(chatId: string, userId: string, page?: number, limit?: number): Promise<ChatWithDetails & { participants: ChatWithDetails['participants']; messages: Message[]; page: number; limit: number; hasMore: boolean }>;
  addParticipant(chatId: string, participants: string[], requesterId: string): Promise<ChatParticipants[]>;
  removeParticipant(chatId: string, userId: string, requesterId: string): Promise<void>;
  getChatParticipants(chatId: string): Promise<ChatParticipants[]>;
  sendMessage(chatId: string, senderId: string, data: SendMessageDto): Promise<Message>;
  getOrCreatePrivateChat(userId: string, targetUserId: string): Promise<Chat>;
  getUserGroupChats(userId: string, page?: number, limit?: number): Promise<{ data: ChatWithDetails[]; total: number; page: number; limit: number; hasMore: boolean }>;
  updateGroupName(chatId: string, userId: string, name: string): Promise<ChatWithDetails | null>;
  promoteParticipant(chatId: string, userId: string, requesterId: string): Promise<import('../entities/chat-participants').ChatParticipants | null>;
  leaveGroup(chatId: string, userId: string): Promise<{ left: boolean }>;
} 