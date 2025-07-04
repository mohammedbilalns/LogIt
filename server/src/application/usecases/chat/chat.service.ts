import { Server } from "socket.io";
import {
  CreateChatDto,
  CreateGroupChatDto,
  SendMessageDto,
} from "../../../application/dtos/chat.dto";
import { IChatService } from "../../../domain/services/chat.service.interface";
import { IChatRepository } from "../../../domain/repositories/chat.repository.interface";
import { IMessageRepository } from "../../../domain/repositories/message.repository.interface";
import { IChatParticipantRepository } from "../../../domain/repositories/chat-participant.repository.interface";
import { IChatActionLogRepository } from "../../../domain/repositories/chat-action-log.repository.interface";
import { BadRequestError, UnauthorizedError } from "../../errors/http.errors";
import { HttpResponse } from "../../../constants/responseMessages";
import { Chat } from "../../../domain/entities/chat.entity";
import { Message } from "../../../domain/entities/message.entity";

export class ChatService implements IChatService {
  private io: Server;

  constructor(
    private chatRepository: IChatRepository,
    private messageRepository: IMessageRepository,
    private chatParticipantRepository: IChatParticipantRepository,
    private chatActionLogRepository: IChatActionLogRepository,
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

  async getUserChats(userId: string, page = 1, limit = 10) {
    const { data, total } = await this.chatRepository.findUserChats(
      userId,
      page,
      limit,
      false
    );
    return {
      data,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  async getChatDetails(chatId: string, userId: string, page = 1, limit = 15) {
    const chat = await this.chatRepository.findChatWithDetailsById(chatId);

    if (!chat) throw new BadRequestError(HttpResponse.CHAT_NOT_FOUND);
    const participantRecord = chat.participants.find(
      (p) => p.userId === userId
    );

    if (!participantRecord) {
      throw new UnauthorizedError(HttpResponse.NOT_A_MEMBER);
    }
    const allowedRoles = ["admin", "member", "removed-user", "left-user"];
    if (!allowedRoles.includes(participantRecord.role)) {
      throw new UnauthorizedError(HttpResponse.NOT_A_MEMBER);
    }

    let participants = chat.participants;

    if (
      participantRecord.role === "admin" ||
      participantRecord.role === "member"
    ) {
      participants = chat.participants.filter(
        (p) => p.role === "admin" || p.role === "member"
      );
    }

    let messages: Message[] = [];
    let hasMore = false;

    if (
      participantRecord.role === "removed-user" ||
      participantRecord.role === "left-user"
    ) {
      const log = await this.chatActionLogRepository.getLastRemovalOrLeaveLog(
        chatId,
        userId
      );

      if (log) {
        const allMessages = await this.messageRepository.findAll({
          filters: { chatId },
          sortBy: "createdAt",
          sortOrder: "desc",
          page: 1,
          limit: 1000,
        });

        const cutoffDate = log.createdAt;

        const filtered = allMessages.data.filter(
          (m) => new Date(m.createdAt) <= cutoffDate
        );

        const start = (page - 1) * limit;

        messages = filtered.slice(start, start + limit).reverse();
        hasMore = start + limit < filtered.length;
      } else {
        messages = [];
        hasMore = false;
      }
    } else {
      const { data, total } = await this.messageRepository.findAll({
        filters: { chatId },
        sortBy: "createdAt",
        sortOrder: "desc",
        page,
        limit,
      });
      messages = data.reverse();
      hasMore = page * limit < total;
    }

    return { ...chat, participants, messages, page, limit, hasMore };
  }

  async addParticipant(
    chatId: string,
    participants: string[],
    requesterId: string
  ) {
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
    const currentParticipants =
      await this.chatParticipantRepository.findChatParticipants(chatId);
    const currentCount = currentParticipants.length;

    const newParticipants = [];
    const existingParticipants = [];

    for (const userId of participants) {
      const existingParticipant = currentParticipants.find(
        (p) => p.userId === userId
      );
      if (!existingParticipant) {
        newParticipants.push(userId);
      } else if (
        existingParticipant.role === "removed-user" ||
        existingParticipant.role === "left-user"
      ) {
        existingParticipants.push(userId);
      }
    }

    const totalNewCount = newParticipants.length + existingParticipants.length;
    if (currentCount + totalNewCount > 10) {
      throw new BadRequestError(HttpResponse.GROUP_SIZE_CANNOT_EXCEED_LIMIT);
    }

    const addedParticipants = [];

    // Add new participants
    for (const userId of newParticipants) {
      const participant = await this.chatParticipantRepository.create({
        chatId,
        userId,
        role: "member",
        joinedAt: new Date(),
      });
      await this.chatActionLogRepository.createLog({
        chatId,
        actionBy: requesterId,
        action: "added",
        targetUser: userId,
        message: `User added to group`,
      });
      addedParticipants.push(participant);
    }

    // Re-add existing participants who were removed or left
    for (const userId of existingParticipants) {
      await this.chatParticipantRepository.setRole(chatId, userId, "member");
      await this.chatActionLogRepository.createLog({
        chatId,
        actionBy: requesterId,
        action: "added",
        targetUser: userId,
        message: `User re-added to group`,
      });

      // Get the updated participant record
      const participant = await this.chatParticipantRepository.findParticipant(
        chatId,
        userId
      );
      if (participant) {
        addedParticipants.push(participant);
      }
    }

    return addedParticipants;
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

    await this.chatParticipantRepository.setRole(
      chatId,
      userId,
      "removed-user"
    );

    await this.chatActionLogRepository.createLog({
      chatId,
      actionBy: requesterId,
      action: "removed",
      targetUser: userId,
      message: `User removed from group`,
    });

    this.io.to(userId).emit("user_removed_from_group", {
      chatId,
      message: HttpResponse.REMOVED_FROM_GROUP,
    });

    this.io.to(chatId).emit("participant_removed", {
      chatId,
      removedUserId: userId,
      removedBy: requesterId,
    });

    this.io.to(userId).emit("force_leave_chat_room", chatId);
  }

  async getChatParticipants(chatId: string) {
    return this.chatParticipantRepository.findChatParticipants(chatId);
  }

  private async isUserRemovedOrLeft(
    chatId: string,
    userId: string
  ): Promise<boolean> {
    const participant = await this.chatParticipantRepository.findParticipant(
      chatId,
      userId
    );
    return (
      participant?.role === "removed-user" || participant?.role === "left-user"
    );
  }

  async sendMessage(chatId: string, senderId: string, data: SendMessageDto) {
    const participant = await this.chatParticipantRepository.findParticipant(
      chatId,
      senderId
    );
    if (!participant) throw new UnauthorizedError(HttpResponse.NOT_A_MEMBER);
    if (participant.role !== "admin" && participant.role !== "member") {
      throw new UnauthorizedError(HttpResponse.NO_PERMISSION_TO_MESSAGE);
    }

    const isRemovedOrLeft = await this.isUserRemovedOrLeft(chatId, senderId);
    if (isRemovedOrLeft) {
      throw new UnauthorizedError(HttpResponse.NO_PERMISSION_TO_MESSAGE);
    }

    const message = await this.messageRepository.create({
      chatId,
      senderId,
      ...data,
      deletedFor: [],
      seenBy: [senderId],
    });

    await this.chatRepository.update(chatId, { lastMessage: message.id });

    this.io.to(chatId).emit("new_message", message);

    return message;
  }

  async getOrCreatePrivateChat(
    userId: string,
    targetUserId: string
  ): Promise<Chat> {
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

  async getUserGroupChats(userId: string, page = 1, limit = 10) {
    const { data, total } = await this.chatRepository.findUserChats(
      userId,
      page,
      limit,
      true
    );
    return {
      data,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  async updateGroupName(chatId: string, userId: string, name: string) {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat || !chat.isGroup)
      throw new BadRequestError(HttpResponse.CHAT_NOT_FOUND);
    const participant = await this.chatParticipantRepository.findParticipant(
      chatId,
      userId
    );
    if (!participant || participant.role !== "admin")
      throw new UnauthorizedError(HttpResponse.ONLY_ADMIN_CAN_CHANGE_NAME);
    await this.chatRepository.update(chatId, { name });
    await this.chatActionLogRepository.createLog({
      chatId,
      actionBy: userId,
      action: "renamed",
      message: `Group chat name updated to "${name}"`,
    });
    return this.chatRepository.findChatWithDetailsById(chatId);
  }

  async promoteParticipant(
    chatId: string,
    userId: string,
    requesterId: string
  ) {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat || !chat.isGroup)
      throw new BadRequestError(HttpResponse.CHAT_NOT_FOUND_OR_NOT_GROUP);
    const requester = await this.chatParticipantRepository.findParticipant(
      chatId,
      requesterId
    );
    if (!requester || requester.role !== "admin")
      throw new UnauthorizedError(HttpResponse.ONLY_ADMIN_CAN_PROMOTE);
    const participant = await this.chatParticipantRepository.findParticipant(
      chatId,
      userId
    );
    if (!participant) throw new BadRequestError(HttpResponse.NOT_A_PARTICIPANT);
    if (participant.role === "admin") return participant;
    const result = await this.chatParticipantRepository.updateRole(
      chatId,
      userId,
      "admin"
    );
    await this.chatActionLogRepository.createLog({
      chatId,
      actionBy: requesterId,
      action: "promoted",
      targetUser: userId,
      message: `User promoted to admin`,
    });
    return result;
  }

  async leaveGroup(chatId: string, userId: string) {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat || !chat.isGroup)
      throw new BadRequestError(HttpResponse.CHAT_NOT_FOUND);
    const participant = await this.chatParticipantRepository.findParticipant(
      chatId,
      userId
    );
    if (!participant) throw new BadRequestError(HttpResponse.NOT_A_PARTICIPANT);
    const isAdmin = participant.role === "admin";

    if (isAdmin) {
      const allParticipants =
        await this.chatParticipantRepository.findChatParticipants(chatId);
      const otherAdmins = allParticipants.filter(
        (p) => p.role === "admin" && p.userId !== userId
      );
      if (otherAdmins.length === 0 && allParticipants.length > 1) {
        const otherMembers = allParticipants.filter(
          (p) => p.userId !== userId && p.role === "member"
        );
        if (otherMembers.length > 0) {
          const earliest = otherMembers.reduce((a, b) =>
            a.joinedAt < b.joinedAt ? a : b
          );
          await this.chatParticipantRepository.updateRole(
            chatId,
            earliest.userId,
            "admin"
          );
        }
      }
    }

    await this.chatParticipantRepository.setRole(chatId, userId, "left-user");

    await this.chatActionLogRepository.createLog({
      chatId,
      actionBy: userId,
      action: "left",
      targetUser: userId,
      message: `User voluntarily left the group`,
    });

    this.io.to(userId).emit("user_left_group", {
      chatId,
      message: "You have left this group",
    });

    this.io.to(chatId).emit("participant_left", {
      chatId,
      leftUserId: userId,
    });

    this.io.to(userId).emit("force_leave_chat_room", chatId);

    return { left: true };
  }
}
