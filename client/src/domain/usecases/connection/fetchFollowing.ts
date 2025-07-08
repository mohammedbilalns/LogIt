import { connectionService } from '@/application/services/connectionService';

export async function fetchFollowing(userId: string): Promise<any> {
  return await connectionService.fetchFollowing(userId);
} 