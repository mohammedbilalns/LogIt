import { UserWithoutPassword } from '../entities/user.entity';

export interface ITokenService {
  generateAccessToken(user: UserWithoutPassword): string;
  generateRefreshToken(user: UserWithoutPassword): string;
  generateCsrfToken(): string;
  verifyAccessToken(token: string): { id: string; email: string; role: string };
  verifyRefreshToken(token: string): { id: string; email: string; role: string };
  decodeGoogleToken(token: string): { sub: string; name: string; email: string; picture: string } | null;
} 