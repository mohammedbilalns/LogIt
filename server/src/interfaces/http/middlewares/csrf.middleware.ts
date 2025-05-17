import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const generateToken = () => crypto.randomBytes(32).toString('hex');


export const csrfMiddleware = () => {
  console.log('CSRF middleware called');
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const csrfToken = req.headers['x-csrf-token'];
    console.log('CSRF token:', csrfToken);
    const storedToken = req.cookies['csrf-token'];
    console.log('Stored token:', storedToken);
    if (!csrfToken || !storedToken || csrfToken !== storedToken) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    next();
  };
};

export const setCsrfToken = (_req: Request, res: Response, next: NextFunction) => {
  const token = generateToken();
  console.log('Setting CSRF token:', token);
  res.cookie('csrf-token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  // Send the token in the response header as well
  res.setHeader('x-csrf-token', token);
  next();
}; 