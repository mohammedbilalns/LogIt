import { UserWithoutPassword } from "../entities/user.entity";
import { SignupData, LoginData } from "../../application/dtos";

export interface IAuthService {
  validateAccessToken(token: string): Promise<{
    user: UserWithoutPassword;
    csrfToken: string;
  }>;

  signup(userData: SignupData): Promise<{
    user: UserWithoutPassword;
    csrfToken: string;
  }>;

  verifyOTP(email: string, otp: string): Promise<{
    user: UserWithoutPassword;
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
  }>;

  login(credentials: LoginData): Promise<{
    user: UserWithoutPassword;
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
  }>;

  refreshToken(token: string): Promise<{
    user: UserWithoutPassword;
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
  }>;

  generateCsrfToken(): string;

  resendOTP(email: string): Promise<{ message: string }>;

  googleAuth(token: string): Promise<{
    user: UserWithoutPassword;
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
  }>;

  initiatePasswordReset(email: string): Promise<{ message: string }>;

  verifyResetOTP(email: string, otp: string): Promise<{ message: string }>;

  updatePassword(email: string, newPassword: string): Promise<{ message: string }>;
}
