import axiosInstance from '@/infrastructure/api/axios';
import { API_ROUTES } from '@/constants/routes';
import { Tag } from '@/domain/entities/tag';
import { TagFilters } from '@/domain/usecases/tag/fetchTags';

export const tagServiceImpl = {
  async fetchTags(page?: number, limit?: number, filters?: TagFilters): Promise<{ tags: Tag[]; total: number }> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.promoted !== undefined) params.append('promoted', filters.promoted.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.userId) params.append('userId', filters.userId);
    }
    const response = await axiosInstance.get(`${API_ROUTES.TAGS.BASE}?${params.toString()}`);
    return response.data;
  },
  async createTag(data: Partial<Tag>): Promise<Tag> {
    const response = await axiosInstance.post(API_ROUTES.TAGS.BASE, data);
    return response.data;
  },
  async updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
    const response = await axiosInstance.put(API_ROUTES.TAGS.BY_ID(id), data);
    return response.data;
  },
  async deleteTag(id: string): Promise<void> {
    await axiosInstance.delete(API_ROUTES.TAGS.BY_ID(id));
  },
  promoteTag: async (id: string): Promise<Tag> => {
    const response = await axiosInstance.post(API_ROUTES.TAGS.PROMOTE(id));
    return response.data;
  },
  demoteTag: async (id: string): Promise<Tag> => {
    const response = await axiosInstance.post(API_ROUTES.TAGS.DEMOTE(id));
    return response.data;
  },
}; 