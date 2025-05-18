import { Request, Response } from 'express';
import { AuthService } from '../../../application/usecases/auth/auth.service';
import { COOKIE_OPTIONS, ACCESS_COOKIE_EXPIRY, REFRESH_COOKIE_EXPIRY } from '../../../config/constants';
import { logger } from '../../../utils/logger';

export class AuthController {
  constructor(private authService: AuthService) {}

  private setCsrfToken(res: Response): void {
    const csrfToken = this.authService.generateCsrfToken();
    res.cookie('csrf-token', csrfToken, {
      ...COOKIE_OPTIONS,
      httpOnly: false,
      maxAge: ACCESS_COOKIE_EXPIRY
    });
    res.setHeader('x-csrf-token', csrfToken);
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.signup(req.body);
      this.setCsrfToken(res);
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

      this.setCsrfToken(res);

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
      
      this.setCsrfToken(res);

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
    try {
      // Check for existing access token first
      const accessToken = req.cookies.accessToken;
      if (accessToken) {
        try {
          const user = await this.authService.validateAccessToken(accessToken);
          res.json({
            message: 'Access token is still valid',
            user
          });
          return;
        } catch (error) {
          logger.red('REFRESH_ERROR', 'Access token is invalid');
        }
      }

      const refreshToken = req.cookies.refreshToken;
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

      this.setCsrfToken(res);

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

    res.cookie('csrf-token', '', {
      ...COOKIE_OPTIONS,
      maxAge: 0
    });

    res.json({ message: 'Logout successful' });
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
} 