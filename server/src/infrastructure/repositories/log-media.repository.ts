import { LogMedia } from '../../domain/entities/log-media.entity';
import { ILogMediaRepository } from '../../domain/repositories/logMedia.repository';
import LogMediaModel, {  LogMediaDocument } from '../mongodb/log-media.schema';
import { BaseRepository } from './base.repository';

export class MongoLogMediaRepository extends BaseRepository<LogMediaDocument, LogMedia> implements ILogMediaRepository {
  constructor() {
    super(LogMediaModel);
  }

  protected getSearchFields(): string[] {
    return ['logId', 'url'];
  }

  protected mapToEntity(doc: LogMediaDocument): LogMedia {
    const logMedia = doc.toObject();
    return {
      ...logMedia,
      id: logMedia._id.toString(),
    };
  }

  async createMany(data: Omit<LogMedia, 'id'>[]): Promise<LogMedia[]> {
    const createdLogMedia = await LogMediaModel.insertMany(data);
    return createdLogMedia.map(media => this.mapToEntity(media));
  }

  async findByLogId(logId: string): Promise<LogMedia[]> {
    const logMedia = await LogMediaModel.find({ logId });
    return logMedia.map(media => this.mapToEntity(media));
  }

  async findByLogIds(logIds: string[]): Promise<LogMedia[]> {
    const logMedia = await LogMediaModel.find({ logId: { $in: logIds } });
    return logMedia.map(media => this.mapToEntity(media));
  }

  async deleteByLogId(logId: string): Promise<void> {
    await LogMediaModel.deleteMany({ logId });
  }
} 