import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../../../config/env';
import { logger } from '../../../utils/logger';
import { UserService } from '../../../application/usecases/usermanagement/user.service';
import { COOKIE_OPTIONS } from '../../../config/constants';

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
  const userService = new UserService();
  
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies.accessToken;
      logger.cyan("ACCESS_TOKEN", token);

      if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      // Verify access token
      const decoded = jwt.verify(token, jwtSecret) as { 
        id: string; 
        email: string; 
        role: 'user' | 'admin' | 'superadmin' 
      };
      logger.cyan("decoded data: ", JSON.stringify(decoded));

      try {
        // Check if user is blocked using the service
        await userService.checkUserBlocked(decoded.id);
        req.user = decoded;
        next();
      } catch (error) {
        if (error instanceof Error) {
          // Expire cookies if user is blocked
          res.cookie('accessToken', '', {
            ...COOKIE_OPTIONS,
            maxAge: 0
          });

          res.cookie('refreshToken', '', {
            ...COOKIE_OPTIONS,
            maxAge: 0
          });

          res.status(403).json({ message: error.message });
          return;
        }
        throw error;
      }
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
