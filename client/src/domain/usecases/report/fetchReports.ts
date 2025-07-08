import { reportService } from '@/application/services/reportService';

export async function fetchReports(params: { page?: number; limit?: number; search?: string; status?: string }) {
  return await reportService.fetchReports(params);
} 