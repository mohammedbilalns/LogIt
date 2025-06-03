import { LogTagRepository } from "../../domain/repositories/logTag.repository";
import { LogTag } from "../../domain/entities/LogTag";
import { LogTagModel } from "../mongodb/log-tag.schema";

export class MongoLogTagRepository implements LogTagRepository {
  async create(data: Omit<LogTag, '_id'>): Promise<LogTag> {
    const createdLogTag = await LogTagModel.create(data);
    return createdLogTag.toObject();
  }

  async createMany(data: Omit<LogTag, '_id'>[]): Promise<LogTag[]> {
    const createdLogTags = await LogTagModel.insertMany(data);
    return createdLogTags.map(tag => tag.toObject());
  }

  async findByLogId(logId: string): Promise<LogTag[]> {
    const logTags = await LogTagModel.find({ logId }).lean();
    return logTags;
  }

  async findByLogIds(logIds: string[]): Promise<LogTag[]> {
    const logTags = await LogTagModel.find({ logId: { $in: logIds } }).lean();
    return logTags;
  }

  async deleteByLogId(logId: string): Promise<void> {
    await LogTagModel.deleteMany({ logId });
  }
} 