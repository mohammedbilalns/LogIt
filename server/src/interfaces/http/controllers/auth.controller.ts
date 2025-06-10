import { Request, Response } from 'express';
import { AuthService } from '../../../application/usecases/auth/auth.service';
import { COOKIE_OPTIONS, ACCESS_COOKIE_EXPIRY, REFRESH_COOKIE_EXPIRY } from '../../../config/constants';
import { logger } from '../../../utils/logger';

export class AuthController {
  constructor(private authService: AuthService) {}

  private setCsrfToken(res: Response): void {
    const csrfToken = this.authService.generateCsrfToken();
    res.cookie('csrfToken', csrfToken, {
      ...COOKIE_OPTIONS,
      httpOnly: false,
      maxAge: ACCESS_COOKIE_EXPIRY
    });
    res.setHeader('x-csrf-token', csrfToken);
  }

  getCsrfToken = async (_req: Request, res: Response): Promise<void> => {
    try {
      this.setCsrfToken(res);
      res.json({ message: 'CSRF token generated successfully' });
    } catch {
      logger.red('CSRF_TOKEN_ERROR', 'Failed to generate CSRF token');
      res.status(500).json({ message: 'Failed to generate CSRF token' });
    }
  };

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.signup(req.body);
      res.status(201).json({
        message: 'Signup successful. Please check your email for OTP verification.',
        user
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.red('SIGNUP_ERROR', error.message);
        res.status(400).json({ message: error.message });
      } else {
        logger.red('SIGNUP_ERROR', 'Internal server error');
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    logger.cyan('VERIFY_OTP_REQUEST', 'Verifying OTP');
    try {
      const { email, otp } = req.body;
      const { user, accessToken, refreshToken } = await this.authService.verifyOTP(email, otp);

      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_COOKIE_EXPIRY
      });

      res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_COOKIE_EXPIRY
      });

      res.json({
        message: 'Email verified successfully',
        user
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.red('VERIFY_OTP_ERROR', error.message);
        res.status(400).json({ message: error.message });
      } else {
        logger.red('VERIFY_OTP_ERROR', 'Internal server error');
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await this.authService.login(req.body);

      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_COOKIE_EXPIRY
      });

      res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_COOKIE_EXPIRY
      });
      
      res.json({
        message: 'Login successful',
        user
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.red('LOGIN_ERROR', error.message);
        res.status(400).json({ message: error.message });
      } else {
        logger.red('LOGIN_ERROR', 'Internal server error');
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    logger.cyan("Refresh request received", "refresh");
    
    try {
      // Check for existing access token first
      const accessToken = req.cookies.accessToken;
      logger.cyan("Access Token", accessToken);
      if (accessToken) {
        try {
          const user = await this.authService.validateAccessToken(accessToken);
          logger.cyan("user", JSON.stringify(user));
          res.json({
            message: 'Access token is still valid',
            user
          });
          return;
        } catch {
          logger.red('REFRESH_ERROR', 'Access token is invalid');
        }
      }

      const refreshToken = req.cookies.refreshToken;
      logger.red("Refresh Token", refreshToken);
      if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token required' });
        return;
      }

      const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);

      res.cookie('accessToken', newAccessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_COOKIE_EXPIRY
      });

      res.cookie('refreshToken', newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_COOKIE_EXPIRY
      });

      res.json({
        message: 'Tokens refreshed successfully',
        user
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.red('REFRESH_ERROR', error.message);
        res.status(401).json({ message: error.message });
      } else {
        logger.red('REFRESH_ERROR', 'Internal server error');
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    console.log('Logout request received');
    res.cookie('accessToken', '', {
      ...COOKIE_OPTIONS,
      maxAge: 0
    });

    res.cookie('refreshToken', '', {
      ...COOKIE_OPTIONS,
      maxAge: 0
    });

   

    res.json({ message: 'Logged out successfully' });
  };

  resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await this.authService.resendOTP(email);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.red('RESEND_OTP_ERROR', error.message);
        res.status(400).json({ message: error.message });
      } else {
        logger.red('RESEND_OTP_ERROR', 'Internal server error');
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { credential } = req.body;
      const { user, accessToken, refreshToken } = await this.authService.googleAuth(credential);

      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_COOKIE_EXPIRY
      });

      res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_COOKIE_EXPIRY
      });
      
      // Set CSRF token 
      this.setCsrfToken(res);

      res.json({
        message: 'Google authentication successful',
        user
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.red('GOOGLE_AUTH_ERROR', error.message);
        res.status(400).json({ message: error.message });
      } else {
        logger.red('GOOGLE_AUTH_ERROR', 'Internal server error');
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  initiatePasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await this.authService.initiatePasswordReset(email);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.red('PASSWORD_RESET_ERROR', error.message);
        res.status(400).json({ message: error.message });
      } else {
        logger.red('PASSWORD_RESET_ERROR', 'Internal server error');
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  verifyResetOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const result = await this.authService.verifyResetOTP(email, otp);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.red('VERIFY_RESET_OTP_ERROR', error.message);
        res.status(400).json({ message: error.message });
      } else {
        logger.red('VERIFY_RESET_OTP_ERROR', 'Internal server error');
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, newPassword } = req.body;
      const result = await this.authService.updatePassword(email, newPassword);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.red('UPDATE_PASSWORD_ERROR', error.message);
        res.status(400).json({ message: error.message });
      } else {
        logger.red('UPDATE_PASSWORD_ERROR', 'Internal server error');
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
} 