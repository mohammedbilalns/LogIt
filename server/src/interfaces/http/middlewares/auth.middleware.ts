import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../../../config/env';
import { logger } from '../../../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'user' | 'admin' | 'superadmin';
      };
    }
  }
}

export const authMiddleware = (jwtSecret: string = env.JWT_SECRET) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token = req.cookies.accessToken;
      logger.cyan("ACCESS_TOKEN", token)

      if (!token) {
        // Check for refresh token
        const refreshToken = req.cookies.refreshToken;
        logger.cyan("REFRESH_TOKEN", refreshToken)
        if (!refreshToken) {
          res.status(401).json({ message: 'Authentication required' });
          return;
        }

        try {
          // Verify refresh token
          const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { 
            id: string; 
            email: string; 
            role: 'user' | 'admin' | 'superadmin' 
          };

          // Generate new access token
          token = jwt.sign(
            { id: decoded.id, email: decoded.email, role: decoded.role },
            jwtSecret,
            { expiresIn: '15m' }
          );

          // Set new access token in cookie
          res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 
          });

          req.user = decoded;
        } catch (refreshError) {
          res.status(401).json({ message: 'Invalid or expired refresh token' });
          return;
        }
      } else {
        // Verify existing access token
        const decoded = jwt.verify(token, jwtSecret) as { 
          id: string; 
          email: string; 
          role: 'user' | 'admin' | 'superadmin' 
        };
        req.user = decoded;
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
  };
};

export const authorizeRoles = (...allowedRoles: ('user' | 'admin' | 'superadmin')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource' });
    }

    return next();
  };
};
