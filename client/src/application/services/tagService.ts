import { Tag } from '@/domain/entities/tag';
import { tagServiceImpl } from '@/infrastructure/services/tag.service';
import { TagFilters } from '@/domain/usecases/tag/fetchTags';

export const tagService = {
  fetchTags: (page?: number, limit?: number, filters?: TagFilters): Promise<{ tags: Tag[]; total: number }> => {
    return tagServiceImpl.fetchTags(page, limit, filters);
  },
  createTag: (data: Partial<Tag>): Promise<Tag> => {
    return tagServiceImpl.createTag(data);
  },
  updateTag: (id: string, data: Partial<Tag>): Promise<Tag> => {
    return tagServiceImpl.updateTag(id, data);
  },
  deleteTag: (id: string): Promise<void> => {
    return tagServiceImpl.deleteTag(id);
  },
  promoteTag: (id: string): Promise<Tag> => {
    return tagServiceImpl.promoteTag(id);
  },
  demoteTag: (id: string): Promise<Tag> => {
    return tagServiceImpl.demoteTag(id);
  },
}; 