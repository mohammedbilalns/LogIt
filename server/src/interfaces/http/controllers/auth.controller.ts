import { Request, Response } from "express";
import { IAuthService } from "../../../domain/services/auth.service.interface";
import {
  COOKIE_OPTIONS,
  ACCESS_COOKIE_EXPIRY,
  REFRESH_COOKIE_EXPIRY,
} from "../../../config/constants";
import { HttpStatus } from "../../../config/statusCodes";
import { HttpResponse } from "../../../config/responseMessages";

export class AuthController {
  constructor(private authService: IAuthService) {}

  private setCsrfToken(res: Response): void {
    const csrfToken = this.authService.generateCsrfToken();
    res.cookie("csrfToken", csrfToken, {
      ...COOKIE_OPTIONS,
      httpOnly: false,
      maxAge: ACCESS_COOKIE_EXPIRY,
    });
    res.setHeader("x-csrf-token", csrfToken);
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ) {
    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_COOKIE_EXPIRY,
    });
    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_COOKIE_EXPIRY,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.cookie("accessToken", "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
    res.cookie("refreshToken", "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
  }

  getCsrfToken = async (_req: Request, res: Response): Promise<void> => {
    this.setCsrfToken(res);
    res
      .status(HttpStatus.CREATED)
      .json({ message: HttpResponse.CSRF_GENERATED });
  };

  getUserDetail = async (req: Request, res: Response): Promise<void> => {
    res
      .status(HttpStatus.OK)
      .json({ message: HttpResponse.FETCH_USER, user: req.user });
  };

  signup = async (req: Request, res: Response): Promise<void> => {
    const { user } = await this.authService.signup(req.body);
    this.setCsrfToken(res);
    res.status(HttpStatus.CREATED).json({
      message: HttpResponse.SIGNUP_SUCCESS,
      user: {
        ...user,
        email: req.body.email,
      },
    });
  };

  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const { user, accessToken, refreshToken } =
      await this.authService.verifyOTP(email, otp);

    this.setAuthCookies(res, accessToken, refreshToken);
    this.setCsrfToken(res);

    res.status(HttpStatus.OK).json({
      message: HttpResponse.VERIFIED_EMAIL,
      user,
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { user, accessToken, refreshToken } = await this.authService.login(
      req.body
    );
    this.setAuthCookies(res, accessToken, refreshToken);
    this.setCsrfToken(res);

    res.status(HttpStatus.OK).json({
      message: HttpResponse.LOGIN_SUCCESSFUL,
      user,
    });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
      const user = await this.authService.validateAccessToken(accessToken);
      this.setCsrfToken(res);
      res.status(HttpStatus.OK).json({
        message: HttpResponse.VALID_TOKEN,
        user,
      });
      return;
    }

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: HttpResponse.REQUIRED_TOKEN });
      return;
    }

    try {
      const {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = await this.authService.refreshToken(refreshToken);

      this.setAuthCookies(res, newAccessToken, newRefreshToken);
      this.setCsrfToken(res);

      res.status(HttpStatus.OK).json({
        message: HttpResponse.TOKEN_REFRESH_SUCCESS,
        user,
      });
    } catch {
      this.clearAuthCookies(res);
      res.status(HttpStatus.UNAUTHORIZED).json({
        message: HttpResponse.REQUIRED_TOKEN,
      });
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    this.clearAuthCookies(res);
    res.status(HttpStatus.OK).json({ message: HttpResponse.LOGOUT_SUCCESS });
  };

  resendOTP = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const result = await this.authService.resendOTP(email);
    res.status(HttpStatus.CREATED).json(result);
  };

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body;
    const { user, accessToken, refreshToken } =
      await this.authService.googleAuth(credential);

    this.setAuthCookies(res, accessToken, refreshToken);
    this.setCsrfToken(res);

    res.status(HttpStatus.OK).json({
      message: HttpResponse.GOOGLE_LOGIN_SUCCESS,
      user,
    });
  };

  initiatePasswordReset = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { email } = req.body;
    const result = await this.authService.initiatePasswordReset(email);
    res.status(HttpStatus.OK).json(result);
  };

  verifyResetOTP = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const result = await this.authService.verifyResetOTP(email, otp);
    res.status(HttpStatus.OK).json(result);
  };

  updatePassword = async (req: Request, res: Response): Promise<void> => {
    const { email, newPassword } = req.body;
    const result = await this.authService.updatePassword(email, newPassword);
    res.status(HttpStatus.OK).json(result);
  };
}
