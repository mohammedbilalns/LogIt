import { tagService } from '@/application/services/tagService';
import { Tag } from '@/domain/entities/tag';

export interface TagFilters {
  search?: string;
  promoted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

export async function fetchTags(
  page?: number,
  limit?: number,
  filters?: TagFilters
): Promise<{ tags: Tag[]; total: number }> {
  return await tagService.fetchTags(page, limit, filters);
} 