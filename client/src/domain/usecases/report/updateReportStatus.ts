import { reportService } from '@/application/services/reportService';

export async function updateReportStatus({ id, status }: { id: string; status: 'reviewed' | 'resolved' }) {
  return await reportService.updateReportStatus({ id, status });
} 