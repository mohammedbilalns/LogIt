import { ChatParticipants } from "../entities/chat-participants";
import { IBaseRepository } from "./base.repository.interface";

export interface IChatParticipantRepository
  extends IBaseRepository<ChatParticipants> {
  findParticipant(
    chatId: string,
    userId: string
  ): Promise<ChatParticipants | null>;
  findChatParticipants(chatId: string): Promise<ChatParticipants[]>;
  findUserChats(userId: string): Promise<import('../entities/chat.entity').Chat[]>;
  findPrivateChatBetweenUsers(userId1: string, userId2: string): Promise<import('../entities/chat.entity').Chat | null>;
  updateRole(chatId: string, userId: string, role: string): Promise<ChatParticipants | null>;
  findEarliestJoinedParticipant(chatId: string): Promise<ChatParticipants | null>;
  setRole(chatId: string, userId: string, role: string): Promise<ChatParticipants | null>;
} 