import { IOTPService } from "../../domain/providers/otp.provider.interface";
import { IOTPRepository } from "../../domain/repositories/otp.repository.interface";
import { OTP } from "../../domain/entities/otp.entity";
import { OTP_EXPIRY } from "../../constants/authConstants";
import {
  InvalidOTPError,
  MaxRetryAttemptsExceededError,
  InvalidResetOTPError,
} from "../errors/auth.errors";

export class OTPService implements IOTPService {
  private readonly MAX_RETRY_ATTEMPTS = 4;

  constructor(private otpRepository: IOTPRepository) {}

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOTP(email: string, type: 'verification' | 'reset'): Promise<OTP> {
    const otp = this.generateOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY * 1000);

    const otpData = await this.otpRepository.create({
      email,
      otp,
      expiresAt,
      retryAttempts: 0,
      type,
    });

    return otpData;
  }

  async verifyOTP(email: string, otp: string, type: 'verification' | 'reset'): Promise<boolean> {
    const storedOTP = await this.otpRepository.findByEmail(email);

    if (!storedOTP || storedOTP.otp !== otp || storedOTP.type !== type) {
      if (storedOTP) {
        if (this.hasMaxRetryAttempts(storedOTP)) {
          await this.otpRepository.deleteByEmail(email);
          throw new MaxRetryAttemptsExceededError();
        }
        await this.otpRepository.incrementRetryAttempts(email);
      }
      throw type === 'reset' ? new InvalidResetOTPError() : new InvalidOTPError();
    }

    if (this.isOTPExpired(storedOTP)) {
      await this.otpRepository.deleteByEmail(email);
      throw type === 'reset' ? new InvalidResetOTPError() : new InvalidOTPError();
    }

    return true;
  }

  async resendOTP(email: string, type: 'verification' | 'reset'): Promise<OTP> {
    const storedOTP = await this.otpRepository.findByEmail(email);
    
    if (storedOTP && this.hasMaxRetryAttempts(storedOTP)) {
      await this.otpRepository.deleteByEmail(email);
      throw new MaxRetryAttemptsExceededError();
    }

    const otp = this.generateOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY * 1000);

    if (storedOTP) {
      const updatedOTP = await this.otpRepository.updateByEmail(email, {
        otp,
        expiresAt,
        retryAttempts: (storedOTP.retryAttempts || 0) + 1,
        type,
      });
      return updatedOTP;
    } else {
      const newOTP = await this.otpRepository.create({
        email,
        otp,
        expiresAt,
        retryAttempts: 0,
        type,
      });
      return newOTP;
    }
  }

  async deleteOTP(email: string): Promise<void> {
    await this.otpRepository.deleteByEmail(email);
  }

  isOTPExpired(otp: OTP): boolean {
    return new Date() > otp.expiresAt;
  }

  hasMaxRetryAttempts(otp: OTP): boolean {
    return otp.retryAttempts >= this.MAX_RETRY_ATTEMPTS;
  }

  async hasValidOTP(email: string, type: 'verification' | 'reset'): Promise<boolean> {
    const storedOTP = await this.otpRepository.findByEmail(email);
    return !!(storedOTP && storedOTP.type === type && !this.isOTPExpired(storedOTP));
  }
} 