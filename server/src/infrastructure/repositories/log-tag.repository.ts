import { LogTag } from '../../domain/entities/LogTag';
import { LogTagRepository } from '../../domain/repositories/logTag.repository';
import LogTagModel, {  LogTagDocument } from '../mongodb/log-tag.schema';
import { BaseRepository } from './base.repository';

export class MongoLogTagRepository extends BaseRepository<LogTagDocument, LogTag> implements LogTagRepository {
  constructor() {
    super(LogTagModel);
  }

  protected getSearchFields(): string[] {
    return ['logId', 'tagId', 'userId'];
  }

  protected mapToEntity(doc: LogTagDocument): LogTag {
    const logTag = doc.toObject();
    return {
      ...logTag,
      id: logTag._id.toString(),
    };
  }

  async createMany(data: Omit<LogTag, 'id'>[]): Promise<LogTag[]> {
    const createdLogTags = await LogTagModel.insertMany(data);
    return createdLogTags.map(tag => this.mapToEntity(tag));
  }

  async findByLogId(logId: string): Promise<LogTag[]> {
    const logTags = await LogTagModel.find({ logId });
    return logTags.map(tag => this.mapToEntity(tag));
  }

  async findByLogIds(logIds: string[]): Promise<LogTag[]> {
    const logTags = await LogTagModel.find({ logId: { $in: logIds } });
    return logTags.map(tag => this.mapToEntity(tag));
  }

  async deleteByLogId(logId: string): Promise<void> {
    await LogTagModel.deleteMany({ logId });
  }

  // Override create
  async create(data: Omit<LogTag, 'id'>): Promise<LogTag> {
    const doc = await LogTagModel.create(data);
    return this.mapToEntity(doc);
  }
} 