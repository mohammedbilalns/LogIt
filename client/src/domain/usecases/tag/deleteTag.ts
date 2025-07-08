import { tagService } from '@/application/services/tagService';

export async function deleteTag(id: string): Promise<void> {
  return await tagService.deleteTag(id);
} 