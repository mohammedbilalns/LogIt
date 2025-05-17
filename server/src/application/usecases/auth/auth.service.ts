import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IOTPRepository } from '../../../domain/repositories/otp.repository.interface';
import env from '../../../config/env';
import { OTP_EXPIRY } from '../../../config/constants';
import { MailService } from '../../services/mail.service';
import { TokenService } from '../../services/token.service';
import { ValidationService, SignupData, LoginData } from '../../services/validation.service';
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  EmailNotVerifiedError,
  InvalidOTPError,
  UserNotFoundError,
  InvalidTokenError
} from '../../errors/auth.errors';

export class AuthService {
  private mailService: MailService;
  private tokenService: TokenService;
  private validationService: ValidationService;
  
  constructor(
    private userRepository: IUserRepository,
    private otpRepository: IOTPRepository,
    jwtSecret: string = env.JWT_SECRET
  ) {
    this.mailService = new MailService();
    this.tokenService = new TokenService(jwtSecret);
    this.validationService = new ValidationService();
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async signup(userData: SignupData) {
    const validatedData = this.validationService.validateSignupData(userData);
    
    const existingUser = await this.userRepository.findByEmail(validatedData.email);
    if (existingUser) {
      throw new EmailAlreadyRegisteredError();
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const user = await this.userRepository.create({
      ...validatedData,
      password: hashedPassword,
      isVerified: false
    });

    const otp = this.generateOTP();
    const now = new Date();
    await this.otpRepository.create({
      email: user.email,
      otp,
      createdAt: now,
      expiresAt: new Date(now.getTime() + OTP_EXPIRY * 1000)
    });

    await this.mailService.sendOTP(user.email, otp);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyOTP(email: string, otp: string) {
    const storedOTP = await this.otpRepository.findByEmail(email);
    if (!storedOTP || storedOTP.otp !== otp) {
      throw new InvalidOTPError();
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }

    await this.userRepository.updateVerificationStatus(user.id, true);
    await this.otpRepository.delete(email);

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: this.tokenService.generateAccessToken(userWithoutPassword),
      refreshToken: this.tokenService.generateRefreshToken(userWithoutPassword)
    };
  }

  async login(credentials: LoginData) {
    const validatedData = this.validationService.validateLoginData(credentials);

    const user = await this.userRepository.findByEmail(validatedData.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isVerified) {
      throw new EmailNotVerifiedError();
    }

    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: this.tokenService.generateAccessToken(userWithoutPassword),
      refreshToken: this.tokenService.generateRefreshToken(userWithoutPassword)
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.tokenService.verifyRefreshToken(token);
      const user = await this.userRepository.findById(decoded.id);
      
      if (!user) {
        throw new UserNotFoundError();
      }

      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        accessToken: this.tokenService.generateAccessToken(userWithoutPassword),
        refreshToken: this.tokenService.generateRefreshToken(userWithoutPassword)
      };
    } catch (error) {
      throw new InvalidTokenError();
    }
  }

  generateCsrfToken(): string {
    return this.tokenService.generateCsrfToken();
  }
} 