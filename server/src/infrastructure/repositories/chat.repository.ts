import mongoose from "mongoose";
import { Chat } from "../../domain/entities/chat.entity";
import ChatModel, { ChatDocument } from "../mongodb/chat.schema";
import { BaseRepository } from "./base.repository";
import { IChatRepository } from "../../domain/repositories/chat.repository.interface";
import ChatParticipantsModel from "../mongodb/chat-participants.schema";

export class ChatRepository
  extends BaseRepository<ChatDocument, Chat>
  implements IChatRepository
{
  constructor() {
    super(ChatModel);
  }

  protected getSearchFields(): string[] {
    return ["name"];
  }

  protected mapToEntity(doc: ChatDocument): Chat {
    return {
      id: String(doc._id),
      isGroup: doc.isGroup,
      name: doc.name,
      creator: doc.creator,
      lastMessage: doc.lastMessage,
      deletedAt: doc.deletedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findUserChats(userId: string): Promise<Chat[]> {
    const participantEntries = await ChatParticipantsModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).select("chatId");
    const chatIds = participantEntries.map((p) => p.chatId);

    const chats = await this.model.find({ _id: { $in: chatIds } });
    return chats.map((doc) => this.mapToEntity(doc));
  }

  async findPrivateChat(
    userId1: string,
    userId2: string
  ): Promise<Chat | null> {
    const chats = await this.model.aggregate([
      {
        $match: {
          isGroup: false,
        },
      },
      {
        $lookup: {
          from: "chatparticipants",
          localField: "_id",
          foreignField: "chatId",
          as: "participants",
        },
      },
      {
        $match: {
          "participants.userId": {
            $all: [
              new mongoose.Types.ObjectId(userId1),
              new mongoose.Types.ObjectId(userId2),
            ],
          },
          $expr: { $eq: [{ $size: "$participants" }, 2] },
        },
      },
    ]);

    if (chats.length > 0) {
      return this.mapToEntity(chats[0] as ChatDocument);
    }
    return null;
  }
} 