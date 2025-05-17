import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserWithoutPassword } from '../../domain/entities/user.entity';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '../../config/constants';

export class TokenService {
  constructor(private jwtSecret: string) {}

  generateAccessToken(user: UserWithoutPassword): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  generateRefreshToken(user: UserWithoutPassword): string {
    return jwt.sign(
      { id: user.id, email: user.email, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  }

  generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  verifyRefreshToken(token: string): { id: string; email: string; type?: string } {
    const decoded = jwt.verify(token, this.jwtSecret) as { id: string; email: string; type?: string };
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  }
} 