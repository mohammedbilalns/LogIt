import { Chat } from "../entities/chat.entity";
import { IBaseRepository } from "./base.repository.interface";
 
export interface IChatRepository extends IBaseRepository<Chat> {
  findUserChats(userId: string): Promise<Chat[]>;
  findPrivateChat(userId1: string, userId2: string): Promise<Chat | null>;
} 