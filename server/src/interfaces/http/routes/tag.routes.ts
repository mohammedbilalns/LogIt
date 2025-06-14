import { Router } from "express";
import { TagController } from "../controllers/tag.controller";
import { TagService } from "../../../application/usecases/articles/tag.service";
import { MongoTagRepository } from "../../../infrastructure/repositories/tag.repository";
import { authorizeRoles, authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";
import { csrfMiddleware } from "../middlewares/csrf.middleware";

const router = Router();
const tagRepository = new MongoTagRepository();
const tagService = new TagService(tagRepository);
const tagController = new TagController(tagService);

// Public routes
router.get(
  "/",
  asyncHandler((req, res) => tagController.getTags(req, res))
);
router.get(
  "/search",
  asyncHandler((req, res) => tagController.searchTags(req, res))
);

// Protected routes
router.use(asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)));
router.use(asyncHandler((req, res, next) => authMiddleware()(req, res, next)));

// Get promoted and user's most used tags
router.get(
  "/promoted-and-user",
  asyncHandler((req, res) => tagController.getPromotedAndUserTags(req, res))
);

router.post(
  "/",
  asyncHandler((req, res, next) => authorizeRoles("user")(req, res, next)),
  asyncHandler((req, res) => tagController.createTag(req, res))
);

// Admin Routes
router.post(
  "/:id/promote",
  asyncHandler((req, res, next) =>
    authorizeRoles("admin", "superadmin")(req, res, next)
  ),
  asyncHandler((req, res) => tagController.promoteTag(req, res))
);

router.post(
  "/:id/demote",
  asyncHandler((req, res, next) =>
    authorizeRoles("admin", "superadmin")(req, res, next)
  ),
  asyncHandler((req, res) => tagController.demoteTag(req, res))
);

export default router;
