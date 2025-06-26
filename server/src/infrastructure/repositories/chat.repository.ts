import mongoose from "mongoose";
import { Chat } from "../../domain/entities/chat.entity";
import ChatModel, { ChatDocument } from "../mongodb/chat.schema";
import { BaseRepository } from "./base.repository";
import { IChatRepository, ChatWithDetails } from "../../domain/repositories/chat.repository.interface";
import ChatParticipantsModel from "../mongodb/chat-participants.schema";

interface ParticipantData {
  id: string;
  userId: string;
  role: string;
  name: string;
  profileImage?: string;
}

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

  async findUserChats(userId: string): Promise<ChatWithDetails[]> {
    // Find all chat IDs where the user is a participant
    const participantEntries = await ChatParticipantsModel.find({
      userId: userId,
    }).select("chatId");
    const participantChatIds = participantEntries.map((p) => p.chatId);

    // Find all chat IDs where the user is the creator
    const creatorChats = await this.model.find({ creator: userId }).select("_id");
    const creatorChatIds = creatorChats.map((c) => (c as { _id: mongoose.Types.ObjectId })._id.toString());

    // Merge and deduplicate chat IDs
    const allChatIds = Array.from(new Set([...participantChatIds, ...creatorChatIds]));

    if (allChatIds.length === 0) return [];

    const chats = await this.model.aggregate([
      // Match by chat IDs
      { $match: { _id: { $in: allChatIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
      // Lookup participants by stringified _id
      {
        $lookup: {
          from: "chatparticipants",
          let: { chatIdStr: { $toString: "$_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$chatId", "$$chatIdStr"] } } }
          ],
          as: "participants"
        }
      },
      // Lookup users for participants
      {
        $lookup: {
          from: "users",
          let: { participantIds: "$participants.userId" },
          pipeline: [
            {
              $match: {
                $expr: { $in: [{ $toString: "$_id" }, "$$participantIds"] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                profileImage: 1,
              },
            },
          ],
          as: "users",
        },
      },
      // Add debug field for lastMessage
      {
        $addFields: {
          debugLastMessageId: "$lastMessage"
        }
      },
      // Lookup last message details
      {
        $lookup: {
          from: "messages",
          let: { lastMessageId: "$lastMessage" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [ { $toString: "$_id" }, { $toString: "$$lastMessageId" } ] },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "sender",
              },
            },
            { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                content: 1,
                senderId: 1,
                senderName: "$sender.name",
                createdAt: 1,
              },
            },
          ],
          as: "lastMessageDetails",
        },
      },
      {
        $addFields: {
          lastMessageDetails: { $arrayElemAt: ["$lastMessageDetails", 0] },
        },
      },
      // Only project necessary fields
      {
        $project: {
          _id: 1,
          isGroup: 1,
          participants: {
            $map: {
              input: "$participants",
              as: "participant",
              in: {
                id: "$$participant._id",
                userId: "$$participant.userId",
                name: {
                  $let: {
                    vars: {
                      user: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$users",
                              cond: { $eq: [{ $toString: "$$this._id" }, { $toString: "$$participant.userId" }] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: "$$user.name",
                  },
                },
                profileImage: {
                  $let: {
                    vars: {
                      user: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$users",
                              cond: { $eq: [{ $toString: "$$this._id" }, { $toString: "$$participant.userId" }] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: "$$user.profileImage",
                  },
                },
              },
            },
          },
          lastMessageDetails: 1,
          debugLastMessageId: 1,
        },
      },
    ]);

    // Debug: log the raw aggregation result
    console.log('Aggregated chats:', JSON.stringify(chats, null, 2));

    return chats.map((chat) => ({
      id: String(chat._id),
      isGroup: chat.isGroup,
      name: chat.name,
      creator: chat.creator,
      lastMessage: chat.lastMessage,
      deletedAt: chat.deletedAt,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      participants: chat.participants.map((p: ParticipantData) => ({
        id: String(p.id),
        userId: String(p.userId),
        name: p.name,
        profileImage: p.profileImage,
        role: p.role,
      })),
      lastMessageDetails: chat.lastMessageDetails ? {
        id: String(chat.lastMessageDetails._id),
        content: chat.lastMessageDetails.content,
        senderId: String(chat.lastMessageDetails.senderId),
        senderName: chat.lastMessageDetails.senderName,
        createdAt: chat.lastMessageDetails.createdAt,
      } : undefined,
    }));
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