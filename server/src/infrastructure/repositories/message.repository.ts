import { Message } from "../../domain/entities/message.entity";
import MessageModel, { MessageDocument } from "../mongodb/message.schema";
import { BaseRepository } from "./base.repository";
import { IMessageRepository } from "../../domain/repositories/message.repository.interface";

export class MessageRepository
  extends BaseRepository<MessageDocument, Message>
  implements IMessageRepository
{
  constructor() {
    super(MessageModel);
  }

  protected getSearchFields(): string[] {
    return ["content"];
  }

  protected mapToEntity(doc: MessageDocument): Message {
    return {
      id: String(doc._id),
      chatId: doc.chatId,
      senderId: doc.senderId,
      content: doc.content,
      media: doc.media,
      log: doc.log,
      replyTo: doc.replyTo,
      deletedFor: doc.deletedFor,
      seenBy: doc.seenBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    filters?: Record<string, unknown>;
  }): Promise<{ data: Message[]; total: number }> {
    return super.findAll(params);
  }
} 