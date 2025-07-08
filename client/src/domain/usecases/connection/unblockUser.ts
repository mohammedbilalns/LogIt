import { connectionService } from '@/application/services/connectionService';

export async function unblockUser(targetUserId: string): Promise<any> {
  return await connectionService.unblockUser(targetUserId);
} 