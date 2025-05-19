import { Tag } from '../entities/tag.entity';

export interface ITagRepository {
  create(tag: Omit<Tag, 'id'>): Promise<Tag>;
  findById(id: string): Promise<Tag | null>;
  findByName(name: string): Promise<Tag | null>;
  update(id: string, tag: Partial<Tag>): Promise<Tag | null>;
  delete(id: string): Promise<void>;
  incrementUsageCount(id: string): Promise<void>;
  decrementUsageCount(id: string): Promise<void>;
  fetch(params: {
    page?: number;
    limit?: number;
    search?: string;
    promoted?: boolean;
  }): Promise<{ tags: Tag[]; total: number }>;
} 