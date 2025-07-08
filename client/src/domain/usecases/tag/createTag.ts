import { tagService } from '@/application/services/tagService';
import { Tag } from '@/domain/entities/tag';

export async function createTag(data: Partial<Tag>): Promise<Tag> {
  return await tagService.createTag(data);
} 