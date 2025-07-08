import { tagService } from '@/application/services/tagService';
import { Tag } from '@/domain/entities/tag';

export async function demoteTag(id: string): Promise<Tag> {
  return await tagService.demoteTag(id);
} 