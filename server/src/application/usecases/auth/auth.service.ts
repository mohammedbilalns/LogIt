import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { UserWithoutPassword } from '../../../domain/entities/user.entity';
import env from '../../../config/env';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, OTP_EXPIRY } from '../../../config/constants';

// In-memory OTP storage with expiry
const otpStore = new Map<string, { otp: string; expiry: number }>();
const OTP_EXPIRY_MS = OTP_EXPIRY * 1000;

const signupSchema = z.object({
  name: z.string().min(2).trim(),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string()
});


export class AuthService {
  private transporter: nodemailer.Transporter;
  
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string = env.JWT_SECRET
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
      }
    });
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOTP(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: env.EMAIL_USER,
      to: email,
      subject: 'Verify your email',
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`
    });
  }

  private generateAccessToken(user: UserWithoutPassword): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  private generateRefreshToken(user: UserWithoutPassword): string {
    return jwt.sign(
      { id: user.id, email: user.email, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  }

  private setOTP(email: string, otp: string): void {
    otpStore.set(email, {
      otp,
      expiry: Date.now() + OTP_EXPIRY_MS
    });
  }

  private getOTP(email: string): string | null {
    const data = otpStore.get(email);
    if (!data) return null;
    
    if (Date.now() > data.expiry) {
      otpStore.delete(email);
      return null;
    }
    
    return data.otp;
  }

  private deleteOTP(email: string): void {
    otpStore.delete(email);
  }

  async signup(userData: { name: string; email: string; password: string }) {
    const validatedData = signupSchema.parse(userData);
    
    const existingUser = await this.userRepository.findByEmail(validatedData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const user = await this.userRepository.create({
      ...validatedData,
      password: hashedPassword,
      isVerified: false
    });

    const otp = this.generateOTP();
    this.setOTP(user.email, otp);
    await this.sendOTP(user.email, otp);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyOTP(email: string, otp: string) {
    const storedOTP = this.getOTP(email);
    if (!storedOTP || storedOTP !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.updateVerificationStatus(user.id, true);
    this.deleteOTP(email);

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: this.generateAccessToken(userWithoutPassword),
      refreshToken: this.generateRefreshToken(userWithoutPassword)
    };
  }

  async login(credentials: { email: string; password: string }) {
    const validatedData = loginSchema.parse(credentials);

    const user = await this.userRepository.findByEmail(validatedData.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new Error('Email not verified');
    }

    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: this.generateAccessToken(userWithoutPassword),
      refreshToken: this.generateRefreshToken(userWithoutPassword)
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { id: string; email: string; type?: string };
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        accessToken: this.generateAccessToken(userWithoutPassword),
        refreshToken: this.generateRefreshToken(userWithoutPassword)
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
} 