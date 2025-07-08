import { authService } from '@/application/services/authService';
import { AuthResponse } from '@/types/auth.types';

export async function verifyEmail(email: string, otp: string): Promise<AuthResponse> {
  return await authService.verifyEmail(email, otp);
} 