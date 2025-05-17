import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const generateToken = () => crypto.randomBytes(32).toString('hex');

const PUBLIC_ROUTES = ['/auth/signup', '/auth/login', '/auth/verify-email'];

export const csrfMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Skip CSRF check for public routes
    const path = req.path;
    if (PUBLIC_ROUTES.some(route => path.endsWith(route))) {
      return next();
    }

    const csrfToken = req.headers['x-csrf-token'];
    const storedToken = req.cookies['csrf-token'];

    if (!csrfToken || !storedToken || csrfToken !== storedToken) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    next();
  };
};

export const setCsrfToken = (_req: Request, res: Response, next: NextFunction) => {
  const token = generateToken();
  res.cookie('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  // Send the token in the response so the client can use it in the x-csrf-token header
  res.setHeader('x-csrf-token', token);
  next();
}; 