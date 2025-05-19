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

export const authorizeRoles = (...allowedRoles: ('user' | 'admin' | 'superadmin')[]) => {
  return  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource' });
    }

   return  next();
  };
};