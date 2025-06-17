import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { UserManagementService } from "../../../application/usecases/usermanagement/usermanagement.service";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";
import { validate } from "../middlewares/validation.middleware";
import { updateUserSchema } from "../../../application/validations/admin.validation";

const router = Router();
const userManagementService = new UserManagementService();
const adminController = new AdminController(userManagementService);

router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)),
  asyncHandler((req, res, next) =>
    authorizeRoles("admin", "superadmin")(req, res, next)
  )
);

router.get(
  "/users",
  asyncHandler((req, res) => adminController.fetchUsers(req, res))
);

router.patch(
  "/users/:id",
  validate(updateUserSchema),
  asyncHandler((req, res) => adminController.updateUser(req, res))
);

export default router;
