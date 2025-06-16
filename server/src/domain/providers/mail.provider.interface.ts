// application/interfaces/mail.service.interface.ts
export interface IMailService {
  sendOTP(email: string, otp: string): Promise<void>;
  sendPasswordResetOTP(email: string, otp: string): Promise<void>;
}
