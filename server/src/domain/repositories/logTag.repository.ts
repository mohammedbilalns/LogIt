import { LogTag } from '../entities/log-tag.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ILogTagRepository extends IBaseRepository<LogTag> {
  createMany(data: Omit<LogTag, 'id'>[]): Promise<LogTag[]>;
  findByLogId(logId: string): Promise<LogTag[]>;
  findByLogIds(logIds: string[]): Promise<LogTag[]>;
  deleteByLogId(logId: string): Promise<void>;
  create(data: Omit<LogTag, 'id'>): Promise<LogTag>;
} 