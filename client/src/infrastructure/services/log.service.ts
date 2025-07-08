import { LogService } from '@/domain/services/log.service';
import { Log } from '@/domain/entities/log';
import { Tag } from '@/domain/entities/tag';
import axiosInstance from '@/infrastructure/api/axios';

export class LogServiceImpl implements LogService {
  async fetchLogs(page: number, limit: number): Promise<Log[]> {
    const response = await axiosInstance.get(`/logs?page=${page}&limit=${limit}`);
    return response.data.logs;
  }

  async fetchUserLogs(page: number, limit: number): Promise<Log[]> {
    const response = await axiosInstance.get(`/logs/user?page=${page}&limit=${limit}`);
    return response.data.logs;
  }

  async fetchLog(id: string): Promise<Log> {
    const response = await axiosInstance.get(`/logs/${id}`);
    return response.data.log;
  }

  async createLog(title: string, content: string, tags: Tag[]): Promise<Log> {
    const response = await axiosInstance.post('/logs', { title, content, tags });
    return response.data.log;
  }

  async updateLog(id: string, title: string, content: string, tags: Tag[]): Promise<Log> {
    const response = await axiosInstance.put(`/logs/${id}`, { title, content, tags });
    return response.data.log;
  }

  async deleteLog(id: string): Promise<void> {
    await axiosInstance.delete(`/logs/${id}`);
  }
}

// Export singleton instance
export const logService = new LogServiceImpl(); 