import { userManagementService } from '@/application/services/userManagementService';
import { UpdateProfileData } from '@/types/user-management.types';

export async function updateProfile(data: UpdateProfileData): Promise<any> {
  return await userManagementService.updateProfile(data);
} 