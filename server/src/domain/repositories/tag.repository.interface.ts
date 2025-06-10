import { Tag } from '../entities/tag.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ITagRepository extends IBaseRepository<Tag> {
  findByName(name: string): Promise<Tag | null>;
  incrementUsageCount(id: string): Promise<void>;
  decrementUsageCount(id: string): Promise<void>;
} 