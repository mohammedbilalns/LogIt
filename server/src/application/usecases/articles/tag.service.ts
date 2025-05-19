import { Tag } from '../../../domain/entities/tag.entity';
import { ITagRepository } from '../../../domain/repositories/tag.repository.interface';

export class TagService {
  constructor(private tagRepository: ITagRepository) {}

  async createTag(tag: Omit<Tag, 'id'>): Promise<Tag> {
    return this.tagRepository.create(tag);
  }

  async getTag(id: string): Promise<Tag | null> {
    return this.tagRepository.findById(id);
  }

  async getTags(params: {
    page?: number;
    limit?: number;
    search?: string;
    promoted?: boolean;
  }): Promise<{ tags: Tag[]; total: number }> {
    return this.tagRepository.fetch(params);
  }

  async updateTag(id: string, tag: Partial<Tag>): Promise<Tag | null> {
    return this.tagRepository.update(id, tag);
  }

  async deleteTag(id: string): Promise<void> {
    await this.tagRepository.delete(id);
  }

  async promoteTag(id: string): Promise<Tag | null> {
    return this.tagRepository.update(id, { promoted: true });
  }

  async demoteTag(id: string): Promise<Tag | null> {
    return this.tagRepository.update(id, { promoted: false });
  }
} 