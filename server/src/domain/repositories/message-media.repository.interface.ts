import { MessageMedia } from '../entities/message-media.entity';

export interface IMessageMediaRepository {
  create(media: Omit<MessageMedia, 'id'>): Promise<MessageMedia>;
  findById(id: string): Promise<MessageMedia | null>;
  findByMessageId(messageId: string): Promise<MessageMedia[]>;
  update(id: string, data: Partial<MessageMedia>): Promise<MessageMedia | null>;
  delete(id: string): Promise<boolean>;
} 