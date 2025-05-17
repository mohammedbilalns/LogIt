import { OTP } from '../entities/otp.entity';

export interface IOTPRepository {
  create(otp: Omit<OTP, 'id'>): Promise<OTP>;
  findByEmail(email: string): Promise<OTP | null>;
  delete(email: string): Promise<void>;
} 