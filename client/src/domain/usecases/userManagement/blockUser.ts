import { userManagementService } from '@/application/services/userManagementService';

export async function blockUser(id: string): Promise<any> {
  return await userManagementService.blockUser(id);
} 