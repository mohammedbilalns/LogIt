import { userManagementService } from '@/application/services/userManagementService';
import { User } from '@/types/user.types';

export async function fetchUsers(page: number, limit: number, search: string): Promise<{ users: User[]; total: number }> {
  return await userManagementService.fetchUsers(page, limit, search);
} 