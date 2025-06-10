import { OTP } from '../../domain/entities/otp.entity';
import { IOTPRepository } from '../../domain/repositories/otp.repository.interface';
import OTPModel, {  OTPDocument } from '../mongodb/otp.schema';
import { BaseRepository } from './base.repository';

export class MongoOTPRepository extends BaseRepository<OTPDocument, OTP> implements IOTPRepository {
  constructor() {
    super(OTPModel);
  }

  protected getSearchFields(): string[] {
    return ['email'];
  }

  protected mapToEntity(doc: OTPDocument): OTP {
    const otp = doc.toObject();
    return {
      ...otp,
      id: otp._id.toString(),
    };
  }

  async findByEmail(email: string): Promise<OTP | null> {
    const otp = await OTPModel.findOne({ email });
    
    if (!otp) return null;
    
    // Check if OTP has expired 
    if (new Date() > otp.expiresAt) {
      const mappedOtp = this.mapToEntity(otp);
      await this.delete(mappedOtp.id!);
      return null;
    }
    
    return this.mapToEntity(otp);
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
    
    return this.mapToEntity(result);
  }

  async incrementRetryAttempts(email: string): Promise<void> {
    await OTPModel.updateOne(
      { email },
      { $inc: { retryAttempts: 1 } }
    );
  }
} 