import { authService } from '@/application/services/authService';

export async function logoutUser(): Promise<{ message: string }> {
  return await authService.logout();
} 