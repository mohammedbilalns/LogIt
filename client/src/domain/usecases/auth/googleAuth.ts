import { authService } from '@/application/services/authService';
import { AuthResponse } from '@/types/auth.types';

export async function googleAuth(credential: string): Promise<AuthResponse> {
  return await authService.googleAuth(credential);
} 