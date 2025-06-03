import { LogTag } from '../entities/LogTag';

export interface LogTagRepository {
  create(data: Omit<LogTag, '_id'>): Promise<LogTag>;
  createMany(data: Omit<LogTag, '_id'>[]): Promise<LogTag[]>;
  findByLogId(logId: string): Promise<LogTag[]>;
  findByLogIds(logIds: string[]): Promise<LogTag[]>;
  deleteByLogId(logId: string): Promise<void>;
} 