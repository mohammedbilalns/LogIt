import { API_ROUTES } from '@/constants/routes';
import { Log } from '@/domain/entities/log';
import api from '@/infrastructure/api/axios';

export const logService = {
  async fetchLogs(
    page: number,
    limit: number,
    filters?: string,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{ logs: Log[]; total: number }> {
    const params: any = { page, limit };
    if (filters) params.filters = filters;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    const res = await api.get<{ logs: Log[]; total: number }>(API_ROUTES.LOGS.BASE, { params });
    return res.data;
  },
  async fetchLog(id: string): Promise<Log> {
    const res = await api.get<Log>(API_ROUTES.LOGS.BY_ID(id));
    return res.data;
  },
  async createLog(
    title: string,
    content: string,
    tags: string[],
    mediaUrls: string[]
  ): Promise<Log> {
    const res = await api.post<Log>(API_ROUTES.LOGS.BASE, { title, content, tags, mediaUrls });
    return res.data;
  },
  async updateLog(
    id: string,
    title: string,
    content: string,
    tags: string[],
    mediaUrls: string[]
  ): Promise<Log> {
    const res = await api.put<Log>(API_ROUTES.LOGS.BY_ID(id), { title, content, tags, mediaUrls });
    return res.data;
  },
  async deleteLog(id: string): Promise<void> {
    await api.delete(API_ROUTES.LOGS.BY_ID(id));
  },
};
