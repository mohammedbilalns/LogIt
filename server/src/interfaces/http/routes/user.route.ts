import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../../../application/usecases/usermanagement/user.service';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware';
import { csrfMiddleware } from '../middlewares/csrf.middleware';
import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

// Protected routes
router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next))
);

// Update profile route
router.put('/update-profile',
  asyncHandler((req, res, next) => authorizeRoles('user')(req, res, next)),
  asyncHandler((req, res) => userController.updateProfile(req, res))
);

// Change password route
router.put('/change-password',
  asyncHandler((req, res, next) => authorizeRoles('user')(req, res, next)),
  asyncHandler((req, res) => userController.changePassword(req, res))
);

export default router; 