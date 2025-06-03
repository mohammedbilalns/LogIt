import { LogRepository } from "../../domain/repositories/LogRepository";
import { Log } from "../../domain/entities/Log";
import { LogModel } from "../mongodb/LogSchema";

export class MongoLogRepository implements LogRepository {
  async create(log: Log): Promise<Log> {
    const createdLog = await LogModel.create(log);
    return createdLog.toObject();
  }

  async findById(id: string): Promise<Log | null> {
    const log = await LogModel.findById(id).lean();
    return log;
  }

  async findByUserId(userId: string): Promise<Log[]> {
    const logs = await LogModel.find({ userId }).lean();
    return logs;
  }

  async update(log: Log): Promise<Log | null> {
    const updatedLog = await LogModel.findByIdAndUpdate(log.id, log, { new: true }).lean();
    return updatedLog;
  }

  async delete(id: string): Promise<boolean> {
    const result = await LogModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async findAll(): Promise<Log[]> {
    const logs = await LogModel.find().lean();
    return logs;
  }
} 