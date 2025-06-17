import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { IAuthService } from "../../../domain/services/auth.service.interface";
import { AuthService } from "../../../application/usecases/auth/auth.service";
import { MongoUserRepository } from "../../../infrastructure/repositories/user.repository";
import { MongoOTPRepository } from "../../../infrastructure/repositories/otp.repository";
import { MailService } from "../../../application/providers/mail.provider";
import { TokenService } from "../../../application/providers/token.provider";
import { OTPService } from "../../../application/providers/otp.provider";
import { BcryptCryptoProvider } from "../../../application/providers/crypto.provider";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { validate } from "../middlewares/validation.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";
import env from "../../../config/env";
import {
  signupSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  googleAuthSchema,
} from "../../../application/validations/auth.validation";

const router = Router();

const userRepository = new MongoUserRepository();
const otpRepository = new MongoOTPRepository();
const otpService = new OTPService(otpRepository);
const mailService = new MailService();
const tokenService = new TokenService(env.JWT_SECRET);
const cryptoProvider = new BcryptCryptoProvider();

const authService: IAuthService = new AuthService(
  userRepository,
  otpService,
  mailService,
  tokenService,
  cryptoProvider
);
const authController = new AuthController(authService);

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
  validate(googleAuthSchema),
  asyncHandler((req, res) => authController.googleAuth(req, res))
);

router.use(asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)));

router.post(
  "/signup",
  validate(signupSchema),
  asyncHandler((req, res) => authController.signup(req, res))
);

router.post(
  "/verify-otp",
  validate(verifyOTPSchema),
  asyncHandler((req, res) => authController.verifyOTP(req, res))
);

router.post(
  "/resend-otp",
  validate(resendOTPSchema),
  asyncHandler((req, res) => authController.resendOTP(req, res))
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res))
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler((req, res) => authController.initiatePasswordReset(req, res))
);

router.post(
  "/verify-resetotp",
  validate(verifyOTPSchema),
  asyncHandler((req, res) => authController.verifyResetOTP(req, res))
);

router.post(
  "/update-password",
  validate(updatePasswordSchema),
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
