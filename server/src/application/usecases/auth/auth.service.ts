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
  InvalidOTPError,
  UserNotFoundError,
  InvalidTokenError,
  MaxRetryAttemptsExceededError
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

  async validateAccessToken(token: string) {
    try {
      const decoded = this.tokenService.verifyAccessToken(token);
      const user = await this.userRepository.findById(decoded.id);
      
      if (!user) {
        throw new UserNotFoundError();
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new InvalidTokenError();
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async signup(userData: SignupData) {
    const validatedData = this.validationService.validateSignupData(userData);
    
    const existingUser = await this.userRepository.findByEmail(validatedData.email);

    if (existingUser?.isVerified) {
      throw new EmailAlreadyRegisteredError();
    }

    if (existingUser) {
      await this.userRepository.delete(validatedData.email);
      await this.otpRepository.delete(validatedData.email);
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
      expiresAt: new Date(now.getTime() + OTP_EXPIRY * 1000),
      retryAttempts: 0
    });

    await this.mailService.sendOTP(user.email, otp);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyOTP(email: string, otp: string) {
    const storedOTP = await this.otpRepository.findByEmail(email);
    if (!storedOTP || storedOTP.otp !== otp) {
      if (storedOTP) {
        if (storedOTP.retryAttempts >= 4) {
          // Delete both user and OTP documents
          await this.userRepository.delete(email);
          await this.otpRepository.delete(email);
          throw new MaxRetryAttemptsExceededError();
        }
        // Increment retry attempts
        await this.otpRepository.incrementRetryAttempts(email);
      }
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
    if (!user || !user.isVerified) {
      throw new InvalidCredentialsError();
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

  async resendOTP(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }

    const storedOTP = await this.otpRepository.findByEmail(email);
    if (storedOTP && storedOTP.retryAttempts >= 4) {
      // Delete both user and OTP documents
      await this.userRepository.delete(email);
      await this.otpRepository.delete(email);
      throw new MaxRetryAttemptsExceededError();
    }

    // Generate and store new OTP
    const otp = this.generateOTP();
    const now = new Date();
    
    if (storedOTP) {
      await this.otpRepository.update(email, {
        otp,
        createdAt: now,
        expiresAt: new Date(now.getTime() + OTP_EXPIRY * 1000),
        retryAttempts: (storedOTP.retryAttempts || 0) + 1
      });
    } else {
      await this.otpRepository.create({
        email,
        otp,
        createdAt: now,
        expiresAt: new Date(now.getTime() + OTP_EXPIRY * 1000),
        retryAttempts: 0
      });
    }

    await this.mailService.sendOTP(email, otp);
    return { message: 'OTP resent successfully' };
  }
} 