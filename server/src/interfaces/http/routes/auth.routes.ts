import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../../../application/usecases/auth/auth.service';
import { MongoUserRepository } from '../../../infrastructure/database/mongodb/user.repository';
import { authMiddleware } from '../middlewares/auth.middleware';
import { csrfMiddleware, setCsrfToken } from '../middlewares/csrf.middleware';

const router = Router();
const userRepository = new MongoUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Helper to convert middleware to Promise<void>
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Public routes - no CSRF needed for authentication endpoints
router.post('/signup', 
  asyncHandler((req, res) => authController.signup(req, res))
);

router.post('/verify-otp',
  asyncHandler((req, res) => authController.verifyOTP(req, res))
);

router.post('/login',
  asyncHandler((req, res) => authController.login(req, res))
);

// Token refresh - needs CSRF as it uses existing session
router.post('/refresh',
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)),
  asyncHandler((req, res) => authController.refresh(req, res)),
  asyncHandler(setCsrfToken)
);

// Protected routes
router.post('/logout',
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)),
  asyncHandler((req, res) => authController.logout(req, res))
);

export default router; 