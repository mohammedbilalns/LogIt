import { Chat } from "../entities/chat.entity";
import { ChatParticipants } from "../entities/chat-participants";
import { Message } from "../entities/message.entity";
import { CreateChatDto, SendMessageDto } from "../../application/dtos/chat.dto";

export interface IChatService {
  createChat(creatorId: string, data: CreateChatDto): Promise<Chat>;
  getUserChats(userId: string): Promise<Chat[]>;
  getChatDetails(
    chatId: string,
    userId: string
  ): Promise<Chat & { participants: ChatParticipants[]; messages: Message[] }>;
  addParticipant(
    chatId: string,
    userId: string,
    requesterId: string
  ): Promise<ChatParticipants>;
  removeParticipant(
    chatId: string,
    userId: string,
    requesterId: string
  ): Promise<void>;
  getChatParticipants(chatId: string): Promise<ChatParticipants[]>;
  sendMessage(
    chatId: string,
    senderId: string,
    data: SendMessageDto
  ): Promise<Message>;
  getChatMessages(chatId: string, userId: string, page?: number, limit?: number): Promise<Message[]>;
  getOrCreatePrivateChat(userId: string, targetUserId: string): Promise<Chat>;
} 