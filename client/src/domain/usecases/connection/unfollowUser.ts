import { connectionService } from '@/application/services/connectionService';

export async function unfollowUser(targetUserId: string): Promise<any> {
  return await connectionService.unfollowUser(targetUserId);
} 