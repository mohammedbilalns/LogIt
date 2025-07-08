import { connectionService } from '@/application/services/connectionService';

export async function followUser(targetUserId: string): Promise<any> {
  return await connectionService.followUser(targetUserId);
} 