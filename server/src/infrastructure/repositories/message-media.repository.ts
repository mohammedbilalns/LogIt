import { MessageMedia } from '../../domain/entities/message-media.entity';
import { IMessageMediaRepository } from '../../domain/repositories/message-media.repository.interface';
import { BaseRepository } from './base.repository';
import MessageMediaModel, { MessageMediaDocument } from '../mongodb/message-media.schema';

export class MessageMediaRepository extends BaseRepository<MessageMediaDocument, MessageMedia> implements IMessageMediaRepository {
  constructor() {
    super(MessageMediaModel);
  }

  protected getSearchFields(): string[] {
    return ['mediaType', 'messageId', 'url'];
  }

  protected mapToEntity(doc: MessageMediaDocument): MessageMedia {
    return {
      id: String(doc._id),
      mediaType: doc.mediaType,
      messageId: doc.messageId,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      url: doc.url,
    };
  }

  async findByMessageId(messageId: string): Promise<MessageMedia[]> {
    const docs = await this.model.find({ messageId });
    return docs.map(this.mapToEntity);
  }
} 