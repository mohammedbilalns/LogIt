import { logService } from '@/application/services/logService';

export async function deleteLog(id: string): Promise<void> {
  return await logService.deleteLog(id);
} 