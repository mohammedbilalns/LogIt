import mongoose from "mongoose";
import { Chat } from "../../domain/entities/chat.entity";
import ChatModel, { ChatDocument } from "../mongodb/chat.schema";
import { BaseRepository } from "./base.repository";
import {
  IChatRepository,
  ChatWithDetails,
} from "../../domain/repositories/chat.repository.interface";
import ChatParticipantsModel from "../mongodb/chat-participants.schema";

interface ParticipantData {
  id: string;
  userId: string;
  role: string;
  name: string;
  profileImage?: string;
}

type ChatAggResult = {
  _id: string;
  isGroup: boolean;
  name?: string;
  creator?: string;
  lastMessage?: string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  participants: ParticipantData[];
  lastMessageDetails?: {
    _id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: Date;
  };
};

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

  async findUserChats(userId: string, page = 1, limit = 10, filterIsGroup?: boolean): Promise<{ data: ChatWithDetails[]; total: number }> {
    const participantEntries = await ChatParticipantsModel.find({
      userId: userId,
    }).select("chatId");
    const participantChatIds = participantEntries.map((p) => p.chatId);
    const creatorChats = await this.model
      .find({ creator: userId })
      .select("_id");
    const creatorChatIds = creatorChats.map((c) =>
      (c as { _id: mongoose.Types.ObjectId })._id.toString()
    );
    const allChatIds = Array.from(
      new Set([...participantChatIds, ...creatorChatIds])
    );
    if (allChatIds.length === 0) return { data: [], total: 0 };
    const skip = (page - 1) * limit;
    const match: Record<string, unknown> = {
      _id: { $in: allChatIds.map((id) => new mongoose.Types.ObjectId(id)) },
    };
    if (filterIsGroup === true) match.isGroup = true;
    if (filterIsGroup === false) match.isGroup = false;
    const result = await this.model.aggregate([
      { $match: match },
      {
        $facet: {
          data: [
            { $sort: { updatedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "chatparticipants",
                let: { chatIdStr: { $toString: "$_id" } },
                pipeline: [
                  { $match: { $expr: { $eq: ["$chatId", "$$chatIdStr"] } } },
                ],
                as: "participants",
              },
            },
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
                  { $project: { _id: 1, name: 1, profileImage: 1 } },
                ],
                as: "users",
              },
            },
            {
              $lookup: {
                from: "messages",
                let: { lastMessageId: "$lastMessage" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: [
                          { $toString: "$_id" },
                          { $toString: "$$lastMessageId" },
                        ],
                      },
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
            {
              $project: {
                _id: 1,
                isGroup: 1,
                name: 1,
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
                                    cond: {
                                      $eq: [
                                        { $toString: "$$this._id" },
                                        { $toString: "$$participant.userId" },
                                      ],
                                    },
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
                                    cond: {
                                      $eq: [
                                        { $toString: "$$this._id" },
                                        { $toString: "$$participant.userId" },
                                      ],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: "$$user.profileImage",
                        },
                      },
                      role: "$$participant.role",
                    },
                  },
                },
                lastMessageDetails: 1,
              },
            },
          ],
          total: [
            { $count: "count" },
          ],
        },
      },
    ]);
    const data = (result[0]?.data || []).map((chat: ChatAggResult) => ({
      id: String(chat._id),
      isGroup: chat.isGroup,
      name: chat.name,
      creator: chat.creator,
      lastMessage: chat.lastMessage,
      deletedAt: chat.deletedAt,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      participants: chat.participants?.map((p: ParticipantData) => ({
        id: String(p.id),
        userId: String(p.userId),
        name: p.name,
        profileImage: p.profileImage,
        role: p.role,
      })) || [],
      lastMessageDetails: chat.lastMessageDetails
        ? {
            id: String(chat.lastMessageDetails._id),
            content: chat.lastMessageDetails.content,
            senderId: String(chat.lastMessageDetails.senderId),
            senderName: chat.lastMessageDetails.senderName,
            createdAt: chat.lastMessageDetails.createdAt,
          }
        : undefined,
    }));
    const total = result[0]?.total?.[0]?.count || 0;
    return { data, total };
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

  async findChatWithDetailsById(
    chatId: string
  ): Promise<ChatWithDetails | null> {
    const chats = await this.model.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(chatId) } },
      {
        $lookup: {
          from: "chatparticipants",
          let: { chatIdStr: { $toString: "$_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$chatId", "$$chatIdStr"] } } },
          ],
          as: "participants",
        },
      },
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
            { $project: { _id: 1, name: 1, profileImage: 1 } },
          ],
          as: "users",
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { lastMessageId: "$lastMessage" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: "$_id" },
                    { $toString: "$$lastMessageId" },
                  ],
                },
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
      {
        $project: {
          _id: 1,
          isGroup: 1,
          name: 1,
          creator: 1,
          lastMessage: 1,
          deletedAt: 1,
          createdAt: 1,
          updatedAt: 1,
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
                              cond: {
                                $eq: [
                                  { $toString: "$$this._id" },
                                  { $toString: "$$participant.userId" },
                                ],
                              },
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
                              cond: {
                                $eq: [
                                  { $toString: "$$this._id" },
                                  { $toString: "$$participant.userId" },
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: "$$user.profileImage",
                  },
                },
                role: "$$participant.role",
              },
            },
          },
          lastMessageDetails: 1,
        },
      },
    ]);
    if (!chats.length) return null;
    const chat = chats[0];
    return {
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
      lastMessageDetails: chat.lastMessageDetails
        ? {
            id: String(chat.lastMessageDetails._id),
            content: chat.lastMessageDetails.content,
            senderId: String(chat.lastMessageDetails.senderId),
            senderName: chat.lastMessageDetails.senderName,
            createdAt: chat.lastMessageDetails.createdAt,
          }
        : undefined,
    };
  }
}
