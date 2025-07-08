import { userManagementService } from '@/application/services/userManagementService';
import { ChangePasswordData } from '@/types/user-management.types';

export async function changePassword(data: ChangePasswordData): Promise<any> {
  return await userManagementService.changePassword(data);
} 