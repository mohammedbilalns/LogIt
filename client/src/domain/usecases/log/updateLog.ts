import { logService } from '@/application/services/logService';
import { Log } from '@/domain/entities/log';

export async function updateLog(
  id: string,
  title: string,
  content: string,
  tags: string[],
  mediaUrls: string[]
): Promise<Log> {
  return await logService.updateLog(id, title, content, tags, mediaUrls);
} 