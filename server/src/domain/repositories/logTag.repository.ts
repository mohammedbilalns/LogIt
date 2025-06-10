import { LogTag } from '../entities/LogTag';
import { IBaseRepository } from './base.repository.interface';

export interface LogTagRepository extends IBaseRepository<LogTag> {
  createMany(data: Omit<LogTag, 'id'>[]): Promise<LogTag[]>;
  findByLogId(logId: string): Promise<LogTag[]>;
  findByLogIds(logIds: string[]): Promise<LogTag[]>;
  deleteByLogId(logId: string): Promise<void>;
  create(data: Omit<LogTag, 'id'>): Promise<LogTag>;
} 