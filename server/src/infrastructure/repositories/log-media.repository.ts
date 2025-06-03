import { LogMediaRepository } from "../../domain/repositories/logMedia.repository";
import { LogMedia } from "../../domain/entities/LogMedia";
import { LogMediaModel } from "../mongodb/log-media.schema";

export class MongoLogMediaRepository implements LogMediaRepository {
  async create(data: Omit<LogMedia, '_id'>): Promise<LogMedia> {
    const createdLogMedia = await LogMediaModel.create(data);
    return createdLogMedia.toObject();
  }

  async createMany(data: Omit<LogMedia, '_id'>[]): Promise<LogMedia[]> {
    const createdLogMedia = await LogMediaModel.insertMany(data);
    return createdLogMedia.map(media => media.toObject());
  }

  async findByLogId(logId: string): Promise<LogMedia[]> {
    const logMedia = await LogMediaModel.find({ logId }).lean();
    return logMedia;
  }

  async findByLogIds(logIds: string[]): Promise<LogMedia[]> {
    const logMedia = await LogMediaModel.find({ logId: { $in: logIds } }).lean();
    return logMedia;
  }

  async deleteByLogId(logId: string): Promise<void> {
    await LogMediaModel.deleteMany({ logId });
  }
} 