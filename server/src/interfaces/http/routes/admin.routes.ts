import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { UserManagementService } from '../../../application/usecases/usermanagement/usermanagement.service';
import { MongoUserRepository } from '../../../infrastructure/repositories/mongodb/user.repository';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware';
import { csrfMiddleware } from '../middlewares/csrf.middleware';

import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();
const userRepository = new MongoUserRepository();
const userManagementService = new UserManagementService(userRepository);
const adminController = new AdminController(userManagementService);

router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => authorizeRoles('admin','superadmin')(req, res, next))
);

// Get all users
router.get('/users', 
  asyncHandler((req, res) => adminController.fetchUsers(req, res))
);

router.patch('/users/:id', 
  asyncHandler((req, res) => adminController.updateUser(req, res))
);

export default router; 