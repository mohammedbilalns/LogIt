import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../../../config/env';

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
      const token = req.cookies.accessToken;

      if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; role: 'user' | 'admin' | 'superadmin' };
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
  };
}; 