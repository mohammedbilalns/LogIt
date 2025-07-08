import { connectionService } from '@/application/services/connectionService';

export async function blockUser(targetUserId: string): Promise<any> {
  return await connectionService.blockUser(targetUserId);
} 