import { userManagementService } from '@/application/services/userManagementService';

export async function unblockUser(id: string): Promise<any> {
  return await userManagementService.unblockUser(id);
} 