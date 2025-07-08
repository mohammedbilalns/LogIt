import { logService } from '@/application/services/logService';
import { Log } from '@/domain/entities/log';

export async function fetchLogs(
  page: number,
  limit: number,
  filters?: string
): Promise<{ logs: Log[]; total: number }> {
  return await logService.fetchLogs(page, limit, filters);
} 