import { userManagementService } from '@/application/services/userManagementService';

export async function fetchUserStats(): Promise<any> {
  return await userManagementService.fetchUserStats();
} 