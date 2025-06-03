import { LogTagRepository } from "../../domain/repositories/LogTagRepository";
import { LogTag } from "../../domain/entities/LogTag";
import { LogTagModel } from "../mongodb/LogTagSchema";

export class MongoLogTagRepository implements LogTagRepository {
  async create(logTag: LogTag): Promise<LogTag> {
    const createdLogTag = await LogTagModel.create(logTag);
    return createdLogTag.toObject();
  }

  async findByLogId(logId: string): Promise<LogTag[]> {
    const logTags = await LogTagModel.find({ logId }).lean();
    return logTags;
  }

  async deleteByLogId(logId: string): Promise<void> {
    await LogTagModel.deleteMany({ logId });
  }
} 