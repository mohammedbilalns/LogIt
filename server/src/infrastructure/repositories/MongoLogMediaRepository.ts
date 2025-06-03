import { LogMediaRepository } from "../../domain/repositories/LogMediaRepository";
import { LogMedia } from "../../domain/entities/LogMedia";
import { LogMediaModel } from "../mongodb/LogMediaSchema";

export class MongoLogMediaRepository implements LogMediaRepository {
  async create(logMedia: LogMedia): Promise<LogMedia> {
    const createdLogMedia = await LogMediaModel.create(logMedia);
    return createdLogMedia.toObject();
  }

  async findByLogId(logId: string): Promise<LogMedia[]> {
    const logMedia = await LogMediaModel.find({ logId }).lean();
    return logMedia;
  }

  async deleteByLogId(logId: string): Promise<void> {
    await LogMediaModel.deleteMany({ logId });
  }
} 