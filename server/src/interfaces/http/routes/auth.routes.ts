import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../../../application/usecases/auth/auth.service";
import { MongoUserRepository } from "../../../infrastructure/repositories/user.repository";
import { MongoOTPRepository } from "../../../infrastructure/repositories/otp.repository";
import { MailService } from "../../../application/providers/mail.provider";
import { TokenService } from "../../../application/providers/token.provider";
import { BcryptCryptoProvider } from "../../../application/providers/crypto.provider";
import { ValidationService } from "../../../application/providers/validation.provider";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";
import env from "../../../config/env";

const router = Router();
const userRepository = new MongoUserRepository();
const otpRepository = new MongoOTPRepository();
const mailService = new MailService();
const tokenService = new TokenService(env.JWT_SECRET);
const cryptoProvider = new BcryptCryptoProvider();
const validationService = new ValidationService();

const authService = new AuthService(
  userRepository,
  otpRepository,
  mailService,
  tokenService,
  cryptoProvider,
  validationService
);
const authController = new AuthController(authService);

// CSRF token route
router.get(
  "/csrf",
  asyncHandler((req, res) => authController.getCsrfToken(req, res))
);

router.post(
  "/refresh",
  asyncHandler((req, res) => authController.refresh(req, res))
);

router.post(
  "/google",
  asyncHandler((req, res) => authController.googleAuth(req, res))
);

router.use(asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)));

// Public routes
router.post(
  "/signup",
  asyncHandler((req, res) => authController.signup(req, res))
);

router.post(
  "/verify-otp",
  asyncHandler((req, res) => authController.verifyOTP(req, res))
);

router.post(
  "/resend-otp",
  asyncHandler((req, res) => authController.resendOTP(req, res))
);

router.post(
  "/login",
  asyncHandler((req, res) => authController.login(req, res))
);

router.post(
  "/reset-password",
  asyncHandler((req, res) => authController.initiatePasswordReset(req, res))
);

router.post(
  "/verify-resetotp",
  asyncHandler((req, res) => authController.verifyResetOTP(req, res))
);

router.post(
  "/update-password",
  asyncHandler((req, res) => authController.updatePassword(req, res))
);

router.use(asyncHandler((req, res, next) => authMiddleware()(req, res, next)));
// Protected routes
router.post(
  "/logout",
  asyncHandler((req, res, next) =>
    authorizeRoles("user", "admin", "superadmin")(req, res, next)
  ),
  asyncHandler((req, res) => authController.logout(req, res))
);

export default router;
