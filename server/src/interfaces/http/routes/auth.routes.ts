import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../../../application/usecases/auth/auth.service';
import { MongoUserRepository } from '../../../infrastructure/repositories/mongodb/user.repository';
import { MongoOTPRepository } from '../../../infrastructure/repositories/mongodb/otp.repository';
import { authMiddleware } from '../middlewares/auth.middleware';
import { csrfMiddleware } from '../middlewares/csrf.middleware';
import { asyncHandler } from '../../../utils/asyncHandler'

const router = Router();
const userRepository = new MongoUserRepository();
const otpRepository = new MongoOTPRepository();
const authService = new AuthService(userRepository, otpRepository);
const authController = new AuthController(authService);


// Public routes
router.post('/signup', 
  asyncHandler((req, res) => authController.signup(req, res))
);

router.post('/google',
  asyncHandler((req, res) => authController.googleAuth(req, res))
);

router.post('/verify-otp',
  asyncHandler((req, res) => authController.verifyOTP(req, res))
);

router.post('/resend-otp',
  asyncHandler((req, res) => authController.resendOTP(req, res))
);

router.post('/login',
  asyncHandler((req, res) => authController.login(req, res))
);

router.post('/reset-password',
  asyncHandler((req, res) => authController.initiatePasswordReset(req, res))
);

router.post('/verify-resetotp',
  asyncHandler((req, res) => authController.verifyResetOTP(req, res))
);

router.post('/update-password',
  asyncHandler((req, res) => authController.updatePassword(req, res))
);

// Token refresh 
router.post('/refresh',
  asyncHandler((req, res) => authController.refresh(req, res))
);

// Protected routes
router.post('/logout',
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)),
  asyncHandler((req, res) => authController.logout(req, res))
);

export default router; 