import { logService } from '@/application/services/logService';
import { Log } from '@/domain/entities/log';

export async function fetchLog(id: string): Promise<Log> {
  return await logService.fetchLog(id);
} 