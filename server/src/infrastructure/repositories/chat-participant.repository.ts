import { ChatParticipants } from "../../domain/entities/chat-participants";
import ChatParticipantsModel, {
  ChatParticipantsDocument,
} from "../mongodb/chat-participants.schema";
import { BaseRepository } from "./base.repository";
import { IChatParticipantRepository } from "../../domain/repositories/chat-participant.repository.interface";
import ChatModel, { ChatDocument } from "../mongodb/chat.schema";
import { Chat } from "../../domain/entities/chat.entity";

export interface ChatParticipantWithUser extends ChatParticipants {
  name: string;
  profileImage?: string;
}

export class ChatParticipantRepository
  extends BaseRepository<ChatParticipantsDocument, ChatParticipants>
  implements IChatParticipantRepository
{
  constructor() {
    super(ChatParticipantsModel);
  }

  protected getSearchFields(): string[] {
    return [];
  }

  protected mapToEntity(doc: ChatParticipantsDocument): ChatParticipants {
    return {
      id: String(doc._id),
      chatId: doc.chatId,
      userId: doc.userId,
      role: doc.role,
      joinedAt: doc.joinedAt,
      isMuted: doc.isMuted,
      isBlocked: doc.isBlocked,
      leftAt: doc.leftAt,
    };
  }

  async findParticipant(
    chatId: string,
    userId: string
  ): Promise<ChatParticipants | null> {
    const doc = await this.model.findOne({ chatId, userId });
    return doc ? this.mapToEntity(doc) : null;
  }

  async findChatParticipants(
    chatId: string
  ): Promise<ChatParticipantWithUser[]> {
    const docs = await this.model.aggregate([
      { $match: { chatId } },
      {
        $lookup: {
          from: "users",
          let: { userIdStr: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$userIdStr", { $toString: "$_id" }] },
              },
            },
          ],
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          id: "$_id",
          chatId: 1,
          userId: 1,
          role: 1,
          joinedAt: 1,
          isMuted: 1,
          isBlocked: 1,
          leftAt: 1,
          name: "$user.name",
          profileImage: "$user.profileImage",
        },
      },
    ]);
    return docs.map((doc: unknown) => {
      const participant = doc as ChatParticipantWithUser;
      return {
        ...participant,
        id: String(participant.id),
        userId: String(participant.userId),
      };
    });
  }

  async findUserChats(userId: string): Promise<Chat[]> {
    // Find all chat participant entries for the user
    const participantEntries = await this.model.find({ userId });
    const chatIds = participantEntries.map((p) => p.chatId);
    // Find all chats with those IDs
    const chats = await ChatModel.find({
      _id: { $in: chatIds },
      isGroup: false,
    });
    return chats.map((doc: ChatDocument) => ({
      id: String(doc._id),
      isGroup: doc.isGroup,
      name: doc.name,
      creator: doc.creator,
      lastMessage: doc.lastMessage,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async findPrivateChatBetweenUsers(
    userId1: string,
    userId2: string
  ): Promise<Chat | null> {
    // Find all non-group chats where userId1 is a participant
    const participantEntries1 = await this.model.find({ userId: userId1 });
    const chatIds1 = participantEntries1.map((p) => p.chatId);
    if (chatIds1.length === 0) return null;
    // Find all non-group chats where userId2 is a participant
    const participantEntries2 = await this.model.find({
      userId: userId2,
      chatId: { $in: chatIds1 },
    });
    const chatIds2 = participantEntries2.map((p) => p.chatId);
    if (chatIds2.length === 0) return null;
    // Find the chat document (must be non-group)
    const chatDoc = await ChatModel.findOne({
      _id: { $in: chatIds2 },
      isGroup: false,
    });
    if (!chatDoc) return null;
    return {
      id: String(chatDoc._id),
      isGroup: chatDoc.isGroup,
      name: chatDoc.name,
      creator: chatDoc.creator,
      lastMessage: chatDoc.lastMessage,
      createdAt: chatDoc.createdAt,
      updatedAt: chatDoc.updatedAt,
    };
  }

  async updateRole(chatId: string, userId: string, role: string): Promise<ChatParticipants | null> {
    const doc = await this.model.findOneAndUpdate(
      { chatId, userId },
      { $set: { role } },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async findEarliestJoinedParticipant(chatId: string): Promise<ChatParticipants | null> {
    const doc = await this.model.findOne({ chatId }).sort({ joinedAt: 1 });
    return doc ? this.mapToEntity(doc) : null;
  }

  async setRole(chatId: string, userId: string, role: string): Promise<ChatParticipants | null> {
    const doc = await this.model.findOneAndUpdate(
      { chatId, userId },
      { $set: { role } },
      { new: true }
    );
    return doc ? this.mapToEntity(doc) : null;
  }
}
