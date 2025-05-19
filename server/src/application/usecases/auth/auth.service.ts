import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
  MaxRetryAttemptsExceededError,
  EmailAlreadyWithGoogleIdError,
  PasswordResetNotAllowedError,
  InvalidResetOTPError,
  UserBlockedError
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

      const userWithoutPassword = {
        ...user,
        password: undefined
      };
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

    if(existingUser?.isBlocked) {
      throw new UserBlockedError();
    }
    if(!existingUser?.password && existingUser?.googleId) {
      throw new EmailAlreadyWithGoogleIdError();
    }
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
      isVerified: false,
      role: 'user'
    });

    const otp = this.generateOTP();
    const now = new Date();
    await this.otpRepository.create({
      email: user.email,
      otp,
      createdAt: now,
      expiresAt: new Date(now.getTime() + OTP_EXPIRY * 1000),
      retryAttempts: 0,
      type: 'verification'
    });

    await this.mailService.sendOTP(user.email, otp);

    const userWithoutPassword = {
      ...user,
      password: undefined
    };
    return userWithoutPassword;
  }

  async verifyOTP(email: string, otp: string) {
    const storedOTP = await this.otpRepository.findByEmail(email);

    if (!storedOTP || storedOTP.otp !== otp || storedOTP.type !== 'verification') {
      if (storedOTP) {
        if (storedOTP.retryAttempts >= 4) {
          await this.userRepository.delete(email);
          await this.otpRepository.delete(email);
          throw new MaxRetryAttemptsExceededError();
        }
        await this.otpRepository.incrementRetryAttempts(email);
      }
      throw new InvalidOTPError();
    }

    const user = await this.userRepository.findByEmail(email);
    if(user?.isBlocked) {
      throw new UserBlockedError();
    }
    if (!user) {
      throw new UserNotFoundError();
    }

    await this.userRepository.updateVerificationStatus(user.id, true);
    await this.otpRepository.delete(email);

    const userWithoutPassword = {
      ...user,
      password: undefined
    };
    return {
      user: userWithoutPassword,
      accessToken: this.tokenService.generateAccessToken(userWithoutPassword),
      refreshToken: this.tokenService.generateRefreshToken(userWithoutPassword)
    };
  }

  async login(credentials: LoginData) {
    const validatedData = this.validationService.validateLoginData(credentials);

    const user = await this.userRepository.findByEmail(validatedData.email);
    if(!user?.password && user?.googleId) {
      throw new EmailAlreadyWithGoogleIdError();
    }
    if(user?.isBlocked) {
      throw new UserBlockedError();
    }
    if (!user || !user.isVerified || !user.password) {
      throw new InvalidCredentialsError();
    }

    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    const userWithoutPassword = {
      ...user,
      password: undefined
    };
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

      const userWithoutPassword = {
        ...user,
        password: undefined
      };
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
      await this.userRepository.delete(email);
      await this.otpRepository.delete(email);
      throw new MaxRetryAttemptsExceededError();
    }

    const otp = this.generateOTP();
    const now = new Date();
    
    if (storedOTP) {
      await this.otpRepository.update(email, {
        otp,
        createdAt: now,
        expiresAt: new Date(now.getTime() + OTP_EXPIRY * 1000),
        retryAttempts: (storedOTP.retryAttempts || 0) + 1,
        type: 'verification'
      });
    } else {
      await this.otpRepository.create({
        email,
        otp,
        createdAt: now,
        expiresAt: new Date(now.getTime() + OTP_EXPIRY * 1000),
        retryAttempts: 0,
        type: 'verification'
      });
    }

    await this.mailService.sendOTP(email, otp);
    return { message: 'OTP resent successfully' };
  }

  async googleAuth(token: string) {
    try {
      const decoded = jwt.decode(token) as {
        email: string;
        name: string;
        picture: string;
        sub: string;
      } | null;


      if (!decoded) {
        throw new InvalidCredentialsError();
      }

      let user = await this.userRepository.findByEmail(decoded.email);
      
      if(user?.isBlocked) {
        throw new UserBlockedError();
      }

      if (!user) {
        user = await this.userRepository.create({
          name: decoded.name,
          email: decoded.email,
          isVerified: true,
          googleId: decoded.sub,
          profileImage: decoded.picture,
          provider: 'google',
          role: 'user'
        });
      } else if (!user.googleId) {
        const updatedUser = await this.userRepository.updateById(user.id, {
          googleId: decoded.sub,
          profileImage: decoded.picture,
          provider: 'google',
          isVerified: true,
          role: user.role || 'user'
        });
        if (!updatedUser) {
          throw new InvalidCredentialsError();
        }
        user = updatedUser;
      }

      const userWithoutPassword = {
        ...user,
        password: undefined
      };
      return {
        user: userWithoutPassword,
        accessToken: this.tokenService.generateAccessToken(userWithoutPassword),
        refreshToken: this.tokenService.generateRefreshToken(userWithoutPassword)
      };
    } catch (error) {
      throw new InvalidCredentialsError();
    }
  }

  async initiatePasswordReset(email: string) {
    const user = await this.userRepository.findByEmail(email);
    
    if(user?.isBlocked) {
      throw new UserBlockedError();
    }
    if (!user || user.role === 'admin'|| user.role === 'superadmin') {
      throw new UserNotFoundError();
    }

    if (!user.password) {
      throw new PasswordResetNotAllowedError();
    }

    const otp = this.generateOTP();
    const now = new Date();
    
    await this.otpRepository.delete(email); // Clear any existing OTP
    await this.otpRepository.create({
      email,
      otp,
      createdAt: now,
      expiresAt: new Date(now.getTime() + OTP_EXPIRY * 1000),
      retryAttempts: 0,
      type: 'reset'
    });

    await this.mailService.sendPasswordResetOTP(email, otp);
    return { message: 'Password reset OTP sent successfully' };
  }

  async verifyResetOTP(email: string, otp: string) {
    const storedOTP = await this.otpRepository.findByEmail(email);
    
    if (!storedOTP || storedOTP.otp !== otp || storedOTP.type !== 'reset') {
      if (storedOTP) {
        if (storedOTP.retryAttempts >= 4) {
          await this.otpRepository.delete(email);
          throw new MaxRetryAttemptsExceededError();
        }
        await this.otpRepository.incrementRetryAttempts(email);
      }
      throw new InvalidResetOTPError();
    }

    if (new Date() > storedOTP.expiresAt) {
      await this.otpRepository.delete(email);
      throw new InvalidResetOTPError();
    }

    return { message: 'OTP verified successfully' };
  }

  async updatePassword(email: string, newPassword: string) {
    const validatedData = this.validationService.validateResetPasswordData({ email, newPassword });
    const user = await this.userRepository.findByEmail(validatedData.email);
    
    if(user?.isBlocked) {
      throw new UserBlockedError();
    }
    if (!user) {
      throw new UserNotFoundError();
    }

    const storedOTP = await this.otpRepository.findByEmail(validatedData.email);
    if (!storedOTP || storedOTP.type !== 'reset') {
      throw new InvalidResetOTPError();
    }

    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
    await this.userRepository.updateById(user.id, { password: hashedPassword });
    await this.otpRepository.delete(validatedData.email);

    return { message: 'Password updated successfully' };
  }
} 