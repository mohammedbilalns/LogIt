import { Log } from "../../domain/entities/log.entity";
import { ILogRepository } from "../../domain/repositories/log.repository";
import LogModel, { LogDocument } from "../mongodb/log.schema";
import { BaseRepository } from "./base.repository";
import mongoose from "mongoose";

export class MongoLogRepository
  extends BaseRepository<LogDocument, Log>
  implements ILogRepository
{
  constructor() {
    super(LogModel);
  }

  protected getSearchFields(): string[] {
    return ["title", "content"];
  }

  protected mapToEntity(doc: LogDocument): Log {
    const log = doc.toObject();
    return {
      ...log,
      id: log._id.toString(),
    };
  }

  async findByUserId(userId: string): Promise<Log[]> {
    const logs = await LogModel.find({ userId });
    return logs.map((log) => this.mapToEntity(log));
  }

  async findMany(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      tags?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<Log[]> {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { userId };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    //  tags are provided, find logs that have all the specified tags
    if (tags && tags.length > 0) {
      const logTagModel = mongoose.model("LogTag");
      const logIds = await logTagModel.distinct("logId", {
        tagId: { $in: tags },
      });
      query._id = { $in: logIds };
    }

    const logs = await LogModel.find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);
    return logs.map((log) => this.mapToEntity(log));
  }

  async countLogs(
    userId: string,
    options: {
      search?: string;
      tags?: string[];
    }
  ): Promise<number> {
    const { search, tags } = options;
    const query: Record<string, unknown> = { userId };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    //  tags are provided, count logs that have all the specified tags
    if (tags && tags.length > 0) {
      const logTagModel = mongoose.model("LogTag");
      const logIds = await logTagModel.distinct("logId", {
        tagId: { $in: tags },
      });
      query._id = { $in: logIds };
    }

    return await LogModel.countDocuments(query);
  }
}
