import { API_ROUTES } from '@/constants/routes';
import axiosInstance from '@/infrastructure/api/axios';

export const reportService = {
  async fetchReports({
    page = 1,
    limit = 10,
    search = '',
    status,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && status !== 'all' && { status }),
    });
    const response = await axiosInstance.get(`${API_ROUTES.REPORTS.BASE}?${params.toString()}`);
    return response.data;
  },
  async updateReportStatus({ id, status }: { id: string; status: 'reviewed' | 'resolved' }) {
    const response = await axiosInstance.patch(API_ROUTES.REPORTS.REPORT_STATUS(id), { status });
    return response.data;
  },
  async blockArticle(articleId: string) {
    const response = await axiosInstance.post(API_ROUTES.REPORTS.BLOCK_ARTICLE(articleId));
    return response.data;
  },
  async createReport({
    targetType,
    targetId,
    reason,
  }: {
    targetType: 'article' | 'user';
    targetId: string;
    reason: string;
  }) {
    const response = await axiosInstance.post(API_ROUTES.REPORTS.BASE, {
      targetType,
      targetId,
      reason,
    });
    return response.data;
  },
};
