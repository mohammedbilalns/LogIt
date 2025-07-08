import { authService } from '@/application/services/authService';

export async function resendOTP(email: string): Promise<{ message: string }> {
  return await authService.resendOTP(email);
} 