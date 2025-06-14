import { Request, Response } from "express";
import { AuthService } from "../../../application/usecases/auth/auth.service";
import {
  COOKIE_OPTIONS,
  ACCESS_COOKIE_EXPIRY,
  REFRESH_COOKIE_EXPIRY,
} from "../../../config/constants";
import { HttpStatus } from "../../../config/statusCodes";

export class AuthController {
  constructor(private authService: AuthService) {}

  private setCsrfToken(res: Response): void {
    const csrfToken = this.authService.generateCsrfToken();
    res.cookie("csrfToken", csrfToken, {
      ...COOKIE_OPTIONS,
      httpOnly: false,
      maxAge: ACCESS_COOKIE_EXPIRY,
    });
    res.setHeader("x-csrf-token", csrfToken);
  }

  getCsrfToken = async (_req: Request, res: Response): Promise<void> => {
    this.setCsrfToken(res);
    res.json({ message: "CSRF token generated successfully" });
  };

  getUserDetail = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: "User Refreshed successfully ", user: req.user });
  };

  signup = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.signup(req.body);
    res.json({
      message:
        "Signup successful. Please check your email for OTP verification.",
      user,
    });
  };

  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const { user, accessToken, refreshToken } =
      await this.authService.verifyOTP(email, otp);

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_COOKIE_EXPIRY,
    });

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_COOKIE_EXPIRY,
    });

    res.json({
      message: "Email verified successfully",
      user,
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { user, accessToken, refreshToken } = await this.authService.login(
      req.body
    );

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_COOKIE_EXPIRY,
    });

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_COOKIE_EXPIRY,
    });

    res.json({
      message: "Login successful",
      user,
    });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    // Check for existing access token
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
      const user = await this.authService.validateAccessToken(accessToken);
      res.json({
        message: "Access token is still valid",
        user,
      });
      return;
    }

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Refresh token required" });
      return;
    }

    const {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } = await this.authService.refreshToken(refreshToken);

    res.cookie("accessToken", newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_COOKIE_EXPIRY,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_COOKIE_EXPIRY,
    });

    res.json({
      message: "Tokens refreshed successfully",
      user,
    });
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.cookie("accessToken", "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });

    res.cookie("refreshToken", "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });

    res.json({ message: "Logged out successfully" });
  };

  resendOTP = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const result = await this.authService.resendOTP(email);
    res.json(result);
  };

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body;
    const { user, accessToken, refreshToken } =
      await this.authService.googleAuth(credential);

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_COOKIE_EXPIRY,
    });

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_COOKIE_EXPIRY,
    });

    // Set CSRF token
    this.setCsrfToken(res);

    res.json({
      message: "Google authentication successful",
      user,
    });
  };

  initiatePasswordReset = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { email } = req.body;
    const result = await this.authService.initiatePasswordReset(email);
    res.json(result);
  };

  verifyResetOTP = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const result = await this.authService.verifyResetOTP(email, otp);
    res.json(result);
  };

  updatePassword = async (req: Request, res: Response): Promise<void> => {
    const { email, newPassword } = req.body;
    const result = await this.authService.updatePassword(email, newPassword);
    res.json(result);
  };
}
