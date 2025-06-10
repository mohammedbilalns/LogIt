import { OTP } from '../entities/otp.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IOTPRepository extends IBaseRepository<OTP> {
  findByEmail(email: string): Promise<OTP | null>;
  update(email: string, otp: Partial<OTP>): Promise<OTP>;
  incrementRetryAttempts(email: string): Promise<void>;
} 