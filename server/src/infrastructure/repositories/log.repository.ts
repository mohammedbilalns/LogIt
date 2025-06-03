import { Log } from '../../domain/entities/Log';
import { LogRepository } from '../../domain/repositories/log.repository';
import { LogModel } from '../mongodb/log.schema';

export class MongoLogRepository implements LogRepository {
  async create(data: Omit<Log, '_id'>): Promise<Log> {
    const createdLog = await LogModel.create(data);
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

  async update(id: string, data: Partial<Log>): Promise<Log> {
    const log = await LogModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean();
    if (!log) throw new Error('Log not found');
    return log;
  }

  async delete(id: string): Promise<void> {
    await LogModel.findByIdAndDelete(id);
  }

  async findAll(): Promise<Log[]> {
    const logs = await LogModel.find().lean();
    return logs;
  }

  async findMany(userId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Log[]> {
    const { page = 1, limit = 10, search, tags, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // If tags are provided, we need to find logs that have all the specified tags
    if (tags && tags.length > 0) {
      query._id = {
        $in: await LogModel.distinct('_id', {
          userId,
          'tags.tagId': { $all: tags }
        })
      };
    }

    const logs = await LogModel.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return logs;
  }

  async count(userId: string, options: {
    search?: string;
    tags?: string[];
  }): Promise<number> {
    const { search, tags } = options;
    const query: any = { userId };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // If tags are provided, we need to count logs that have all the specified tags
    if (tags && tags.length > 0) {
      query._id = {
        $in: await LogModel.distinct('_id', {
          userId,
          'tags.tagId': { $all: tags }
        })
      };
    }

    return await LogModel.countDocuments(query);
  }
} 