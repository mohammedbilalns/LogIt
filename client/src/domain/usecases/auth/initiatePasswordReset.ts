import { authService } from '@/application/services/authService';

export async function initiatePasswordReset(email: string): Promise<{ email: string; message: string }> {
  return await authService.initiatePasswordReset(email);
} 