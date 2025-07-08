import { authService } from '@/application/services/authService';
import { AuthResponse } from '@/types/auth.types';

export async function updatePassword(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
  return await authService.updatePassword(email, otp, newPassword);
} 