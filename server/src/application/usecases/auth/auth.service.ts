import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import {
  User,
  UserWithoutPassword,
} from "../../../domain/entities/user.entity";
import { IMailService } from "../../../domain/providers/mail.provider.interface";
import { ITokenService } from "../../../domain/providers/token.provider.interface";
import { IOTPService } from "../../../domain/providers/otp.provider.interface";
import { ICryptoProvider } from "../../../domain/providers/crypto.provider.interface";
import { IAuthService } from "../../../domain/services/auth.service.interface";
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  UserNotFoundError,
  InvalidTokenError,
  EmailAlreadyWithGoogleIdError,
  PasswordResetNotAllowedError,
  UserBlockedError,
} from "../../errors/auth.errors";
import { HttpResponse } from "../../../constants/responseMessages";
import { ResourceNotFoundError } from "../../errors/resource.errors";
import { SignupData, LoginData } from "../../dtos";

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private otpService: IOTPService,
    private mailService: IMailService,
    private tokenService: ITokenService,
    private cryptoProvider: ICryptoProvider
  ) {}

  private createUserWithoutPassword(user: User): UserWithoutPassword {
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  async validateAccessToken(token: string) {
    try {
      const decoded = this.tokenService.verifyAccessToken(token);
      const { id: userId } = decoded;
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new UserNotFoundError();
      }

      return {
        user: this.createUserWithoutPassword(user),
        csrfToken: this.tokenService.generateCsrfToken(),
      };
    } catch {
      throw new InvalidTokenError();
    }
  }

  async signup(userData: SignupData) {
    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser?.isBlocked) {
      throw new UserBlockedError();
    }
    if (!existingUser?.password && existingUser?.googleId) {
      throw new EmailAlreadyWithGoogleIdError();
    }
    if (existingUser?.isVerified) {
      throw new EmailAlreadyRegisteredError();
    }

    if (existingUser) {
      await this.userRepository.deleteByEmail(userData.email);
      await this.otpService.deleteOTP(userData.email);
    }

    const hashedPassword = await this.cryptoProvider.hash(
      userData.password,
      10
    );
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      isVerified: false,
      role: "user",
    });

    const otpData = await this.otpService.createOTP(user.email, "verification");
    await this.mailService.sendOTP(user.email, otpData.otp);

    const userWithoutPassword = this.createUserWithoutPassword(user);
    return {
      user: userWithoutPassword,
      csrfToken: this.tokenService.generateCsrfToken(),
    };
  }

  async verifyOTP(email: string, otp: string) {
    await this.otpService.verifyOTP(email, otp, "verification");

    const user = await this.userRepository.findByEmail(email);
    if (user?.isBlocked) {
      throw new UserBlockedError();
    }
    if (!user) {
      throw new UserNotFoundError();
    }

    const { id: userId } = user;
    await this.userRepository.updateVerificationStatus(userId, true);
    await this.otpService.deleteOTP(email);

    const userWithoutPassword = this.createUserWithoutPassword(user);
    return {
      user: userWithoutPassword,
      accessToken: this.tokenService.generateAccessToken(userWithoutPassword),
      refreshToken: this.tokenService.generateRefreshToken(userWithoutPassword),
      csrfToken: this.tokenService.generateCsrfToken(),
    };
  }

  async login(credentials: LoginData) {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (!user?.password && user?.googleId) {
      throw new EmailAlreadyWithGoogleIdError();
    }
    if (user?.isBlocked) {
      throw new UserBlockedError();
    }
    if (!user || !user.isVerified || !user.password) {
      throw new InvalidCredentialsError();
    }

    const isValidPassword = await this.cryptoProvider.compare(
      credentials.password,
      user.password
    );
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    const userWithoutPassword = this.createUserWithoutPassword(user);
    return {
      user: userWithoutPassword,
      accessToken: this.tokenService.generateAccessToken(userWithoutPassword),
      refreshToken: this.tokenService.generateRefreshToken(userWithoutPassword),
      csrfToken: this.tokenService.generateCsrfToken(),
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.tokenService.verifyRefreshToken(token);
      const { id: userId } = decoded;
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new UserNotFoundError();
      }

      const userWithoutPassword = this.createUserWithoutPassword(user);
      return {
        user: userWithoutPassword,
        accessToken: this.tokenService.generateAccessToken(userWithoutPassword),
        refreshToken:
          this.tokenService.generateRefreshToken(userWithoutPassword),
        csrfToken: this.tokenService.generateCsrfToken(),
      };
    } catch {
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

    const otpData = await this.otpService.resendOTP(email, "verification");
    await this.mailService.sendOTP(email, otpData.otp);
    return { message: HttpResponse.OTP_RESEND };
  }

  async googleAuth(token: string) {
    try {
      const decoded = this.tokenService.decodeGoogleToken(token);

      if (!decoded) {
        throw new InvalidCredentialsError();
      }

      let user = await this.userRepository.findByEmail(decoded.email);

      if (user?.isBlocked) {
        throw new UserBlockedError();
      }

      if (!user) {
        user = await this.userRepository.create({
          name: decoded.name,
          email: decoded.email,
          isVerified: true,
          googleId: decoded.sub,
          profileImage: decoded.picture,
          provider: "google",
          role: "user",
        });
      } else if (!user.googleId) {
        const { id: userId } = user;
        const updatedUser = await this.userRepository.update(userId, {
          googleId: decoded.sub,
          profileImage: decoded.picture,
          provider: "google",
          isVerified: true,
          role: user.role || "user",
        });
        if (!updatedUser) {
          throw new InvalidCredentialsError();
        }
        user = updatedUser;
      }

      const userWithoutPassword = this.createUserWithoutPassword(user);
      return {
        user: userWithoutPassword,
        accessToken: this.tokenService.generateAccessToken(userWithoutPassword),
        refreshToken:
          this.tokenService.generateRefreshToken(userWithoutPassword),
        csrfToken: this.tokenService.generateCsrfToken(),
      };
    } catch {
      throw new InvalidCredentialsError();
    }
  }

  async initiatePasswordReset(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (user?.isBlocked) {
      throw new UserBlockedError();
    }
    if (!user || user.role === "admin" || user.role === "superadmin") {
      throw new UserNotFoundError();
    }

    if (!user.password) {
      throw new PasswordResetNotAllowedError();
    }

    await this.otpService.deleteOTP(email);
    const otpData = await this.otpService.createOTP(email, "reset");
    await this.mailService.sendPasswordResetOTP(email, otpData.otp);
    return { message: HttpResponse.SEND_PASSWORD_RESET_OTP };
  }

  async verifyResetOTP(email: string, otp: string) {
    await this.otpService.verifyOTP(email, otp, "reset");
    return { message: HttpResponse.OTP_RESEND };
  }

  async updatePassword(email: string, newPassword: string) {
    const user = await this.userRepository.findByEmail(email);

    if (user?.isBlocked) {
      throw new UserBlockedError();
    }
    if (!user) {
      throw new UserNotFoundError();
    }

    // Check that a valid reset OTP exists for this email
    const hasValidResetOTP = await this.otpService.hasValidOTP(email, "reset");
    if (!hasValidResetOTP) {
      throw new ResourceNotFoundError(HttpResponse.OTP_NOT_FOUND);
    }

    const hashedPassword = await this.cryptoProvider.hash(newPassword, 10);
    const { id: userId } = user;
    const updatedUser = await this.userRepository.update(userId, {
      password: hashedPassword,
    });
    if (!updatedUser) {
      throw new UserNotFoundError();
    }
    await this.otpService.deleteOTP(email);

    return { message: HttpResponse.PASSWORD_UPDATED };
  }
}
