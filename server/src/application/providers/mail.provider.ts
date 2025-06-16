import nodemailer from "nodemailer";
import env from "../../config/env";

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #007BFF; padding: 20px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">LogIt</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            <h2 style="color: #007BFF;">Email Verification</h2>
            <p>Hello,</p>
            <p>Use the following One-Time Password (OTP) to verify your email address:</p>
            <p style="font-size: 32px; font-weight: bold; color: #007BFF; margin: 20px 0;">${otp}</p>
            <p>This OTP will expire in <strong>5 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} LogIt. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"LogIt" <${env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email address",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      html: htmlContent,
    });
  }

  async sendPasswordResetOTP(email: string, otp: string): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #007BFF; padding: 20px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">LogIt</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            <h2 style="color: #007BFF;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Use the following One-Time Password (OTP) to proceed:</p>
            <p style="font-size: 32px; font-weight: bold; color: #007BFF; margin: 20px 0;">${otp}</p>
            <p>This OTP will expire in <strong>5 minutes</strong>.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} LogIt. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"LogIt" <${env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      text: `Your password reset OTP is: ${otp}. It will expire in 5 minutes.`,
      html: htmlContent,
    });
  }
}
