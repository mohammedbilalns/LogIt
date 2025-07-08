import { tagService } from '@/application/services/tagService';
import { Tag } from '@/domain/entities/tag';

export async function updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
  return await tagService.updateTag(id, data);
} 