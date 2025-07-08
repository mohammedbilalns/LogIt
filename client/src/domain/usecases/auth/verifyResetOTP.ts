import { authService } from '@/application/services/authService';

export async function verifyResetOTP(email: string, otp: string): Promise<{ email: string; message: string }> {
  return await authService.verifyResetOTP(email, otp);
} 