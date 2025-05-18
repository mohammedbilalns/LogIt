import mongoose, { Schema } from 'mongoose';
import { OTP } from '../../../domain/entities/otp.entity';
import { IOTPRepository } from '../../../domain/repositories/otp.repository.interface';

const otpSchema = new Schema<OTP>({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  retryAttempts: { type: Number, default: 0 }
});

// Create TTL index on expiresAt field
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTPModel = mongoose.model<OTP>('OTP', otpSchema);

export class MongoOTPRepository implements IOTPRepository {
  async create(otp: Omit<OTP, 'id'>): Promise<OTP> {
    // If an OTP exists for this email, replace it
    const result = await OTPModel.findOneAndReplace(
      { email: otp.email },
      otp,
      { upsert: true, new: true }
    );
    
    return this.mapToOTP(result);
  }

  async findByEmail(email: string): Promise<OTP | null> {
    const otp = await OTPModel.findOne({ email });
    
    if (!otp) return null;
    
    // Check if OTP has expired 
    if (new Date() > otp.expiresAt) {
      await this.delete(email);
      return null;
    }
    
    return this.mapToOTP(otp);
  }

  async delete(email: string): Promise<void> {
    await OTPModel.deleteOne({ email });
  }

  async update(email: string, otp: Partial<OTP>): Promise<OTP> {
    const result = await OTPModel.findOneAndUpdate(
      { email },
      { $set: otp },
      { new: true }
    );
    
    if (!result) {
      throw new Error('OTP not found');
    }
    
    return this.mapToOTP(result);
  }

  async incrementRetryAttempts(email: string): Promise<void> {
    await OTPModel.updateOne(
      { email },
      { $inc: { retryAttempts: 1 } }
    );
  }

  private mapToOTP(doc: mongoose.Document): OTP {
    const otp = doc.toObject();
    return {
      ...otp,
      id: otp._id.toString(),
    };
  }
} 