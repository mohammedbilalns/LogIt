import { LogMedia } from '../entities/LogMedia';

export interface LogMediaRepository {
  create(data: Omit<LogMedia, '_id'>): Promise<LogMedia>;
  createMany(data: Omit<LogMedia, '_id'>[]): Promise<LogMedia[]>;
  findByLogId(logId: string): Promise<LogMedia[]>;
  findByLogIds(logIds: string[]): Promise<LogMedia[]>;
  deleteByLogId(logId: string): Promise<void>;
} 