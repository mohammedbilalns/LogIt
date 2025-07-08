import { tagService } from '@/application/services/tagService';
import { Tag } from '@/domain/entities/tag';

export async function promoteTag(id: string): Promise<Tag> {
  return await tagService.promoteTag(id);
} 