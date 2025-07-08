import { connectionService } from '@/application/services/connectionService';

export async function fetchFollowers(userId: string): Promise<any> {
  return await connectionService.fetchFollowers(userId);
} 