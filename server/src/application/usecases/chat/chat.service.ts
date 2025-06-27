import { Server } from "socket.io";
import {
  CreateChatDto,
  CreateGroupChatDto,
  SendMessageDto,
} from "../../../application/dtos/chat.dto";
import {
  IChatService,
  ChatWithDetails,
} from "../../../domain/services/chat.service.interface";
import { IChatRepository } from "../../../domain/repositories/chat.repository.interface";
import { IMessageRepository } from "../../../domain/repositories/message.repository.interface";
import { IChatParticipantRepository } from "../../../domain/repositories/chat-participant.repository.interface";
import { BadRequestError, UnauthorizedError } from "../../errors/http.errors";
import { HttpResponse } from "../../../config/responseMessages";
import { Chat } from "../../../domain/entities/chat.entity";

export class ChatService implements IChatService {
  private io: Server;

  constructor(
    private chatRepository: IChatRepository,
    private messageRepository: IMessageRepository,
    private chatParticipantRepository: IChatParticipantRepository,
    io: Server
  ) {
    this.io = io;
  }

  async createChat(creatorId: string, data: CreateChatDto) {
    const { isGroup, name, participants } = data;

    const allParticipants = [...new Set([creatorId, ...participants])];

    if (!isGroup) {
      if (allParticipants.length !== 2) {
        throw new BadRequestError(HttpResponse.PRIVATE_CHAT_PARTICIPANT_ERROR);
      }
      const existingChat = await this.chatRepository.findPrivateChat(
        allParticipants[0],
        allParticipants[1]
      );
      if (existingChat) return existingChat;
    }

    const newChat = await this.chatRepository.create({
      isGroup,
      name: isGroup ? name : undefined,
      creator: creatorId,
    });

    for (const userId of allParticipants) {
      // Check if participant already exists
      const existingParticipant =
        await this.chatParticipantRepository.findParticipant(
          newChat.id,
          userId
        );
      if (!existingParticipant) {
        await this.chatParticipantRepository.create({
          chatId: newChat.id,
          userId,
          role: userId === creatorId ? "admin" : "member",
          joinedAt: new Date(),
        });
      }
    }

    allParticipants.forEach((userId) => {
      this.io.to(userId).emit("new_chat", newChat);
    });

    return newChat;
  }

  async createGroupChat(creatorId: string, data: CreateGroupChatDto) {
    const { name, participants } = data;

    if (!name || name.trim().length === 0) {
      throw new BadRequestError(HttpResponse.REQUIRED_GROUP_NAME);
    }

    if (!participants || participants.length === 0) {
      throw new BadRequestError(HttpResponse.REQUIRED_PARTICIPANTS);
    }

    const allParticipants = [...new Set([creatorId, ...participants])];

    // Create the group chat
    const newChat = await this.chatRepository.create({
      isGroup: true,
      name: name.trim(),
      creator: creatorId,
    });

    // Add all participants to the chat
    for (const userId of allParticipants) {
      await this.chatParticipantRepository.create({
        chatId: newChat.id,
        userId,
        role: userId === creatorId ? "admin" : "member",
        joinedAt: new Date(),
      });
    }

    // Notify all participants about the new group chat
    allParticipants.forEach((userId) => {
      this.io.to(userId).emit("new_group_chat", {
        ...newChat,
        participants: allParticipants,
        groupName: name,
      });
    });

    return newChat;
  }

  async getUserChats(userId: string): Promise<ChatWithDetails[]> {
    // Only return non-group (single) chats
    const allChats = await this.chatRepository.findUserChats(userId);
    return allChats.filter(chat => !chat.isGroup);
  }

  async getChatDetails(chatId: string, userId: string) {
    const chat = await this.chatRepository.findChatWithDetailsById(chatId);
    if (!chat) throw new BadRequestError(HttpResponse.CHAT_NOT_FOUND);

    const participants = chat.participants;
    const participantIds = participants.map((p) => p.userId.toString());
    if (!participantIds.includes(userId)) {
      throw new UnauthorizedError(HttpResponse.NOT_A_MEMBER);
    }

    const messages = await this.getChatMessages(chatId, userId);
    return { ...chat, participants, messages };
  }

  async addParticipant(chatId: string, userId: string, requesterId: string) {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat || !chat.isGroup)
      throw new BadRequestError(HttpResponse.CHAT_NOT_FOUND_OR_NOT_GROUP);

    const requester = await this.chatParticipantRepository.findParticipant(
      chatId,
      requesterId
    );
    if (!requester || requester.role !== "admin") {
      throw new UnauthorizedError(HttpResponse.NO_PERMISSION_ADD);
    }

    const existingParticipant =
      await this.chatParticipantRepository.findParticipant(chatId, userId);
    if (existingParticipant) return existingParticipant;

    return this.chatParticipantRepository.create({
      chatId,
      userId,
      role: "member",
      joinedAt: new Date(),
    });
  }

  async removeParticipant(chatId: string, userId: string, requesterId: string) {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat || !chat.isGroup)
      throw new BadRequestError(HttpResponse.CHAT_NOT_FOUND_OR_NOT_GROUP);

    const requester = await this.chatParticipantRepository.findParticipant(
      chatId,
      requesterId
    );
    if (!requester || (requester.role !== "admin" && userId !== requesterId)) {
      throw new UnauthorizedError(HttpResponse.NO_PERMISSION_REMOVE);
    }

    const participant = await this.chatParticipantRepository.findParticipant(
      chatId,
      userId
    );
    if (!participant) throw new BadRequestError(HttpResponse.NOT_A_PARTICIPANT);

    await this.chatParticipantRepository.delete(participant.id);
  }

  async getChatParticipants(chatId: string) {
    return this.chatParticipantRepository.findChatParticipants(chatId);
  }

  async sendMessage(chatId: string, senderId: string, data: SendMessageDto) {
    const participant = await this.chatParticipantRepository.findParticipant(
      chatId,
      senderId
    );
    if (!participant) throw new UnauthorizedError(HttpResponse.NOT_A_MEMBER);

    const message = await this.messageRepository.create({
      chatId,
      senderId,
      ...data,
      deletedFor: [],
      seenBy: [senderId],
    });

    await this.chatRepository.update(chatId, { lastMessage: message.id });

    // Emit the message to all participants in the chat room
    this.io.to(chatId).emit("new_message", message);

    return message;
  }

  async getChatMessages(chatId: string, userId: string, page = 1, limit = 10) {
    const participant = await this.chatParticipantRepository.findParticipant(
      chatId,
      userId
    );
    if (!participant) throw new UnauthorizedError(HttpResponse.NOT_A_MEMBER);
    // Fetch latest messages
    const { data } = await this.messageRepository.findAll({
      filters: { chatId },
      sortBy: "createdAt",
      sortOrder: "desc",
      page,
      limit,
    });
    return data.reverse();
  }

  async getOrCreatePrivateChat(
    userId: string,
    targetUserId: string
  ): Promise<Chat> {
  
    if (userId === targetUserId) {
      throw new BadRequestError("Cannot create a private chat with yourself.");
    }
    const existingChat =
      await this.chatParticipantRepository.findPrivateChatBetweenUsers(
        userId,
        targetUserId
      );
    if (existingChat) {
      return existingChat;
    }
    const newChat = await this.chatRepository.create({
      isGroup: false,
      creator: userId,
    });
    await this.chatParticipantRepository.create({
      chatId: newChat.id,
      userId,
      role: "admin",
      joinedAt: new Date(),
    });
    await this.chatParticipantRepository.create({
      chatId: newChat.id,
      userId: targetUserId,
      role: "member",
      joinedAt: new Date(),
    });
    return newChat;
  }

  async getUserGroupChats(userId: string): Promise<ChatWithDetails[]> {
    // Fetch all user chats with details, but only return group chats
    return (await this.chatRepository.findUserChats(userId)).filter(chat => chat.isGroup);
  }
}
