import { Router } from "express";
import { TagController } from "../controllers/tag.controller";
import { ITagService } from "../../../domain/services/tag.service.interface";
import { TagService } from "../../../application/services/tag.service";
import { MongoTagRepository } from "../../../infrastructure/repositories/tag.repository";
import { authorizeRoles, authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { validate } from "../middlewares/validation.middleware";
import { createTagSchema } from "../../../application/validations/tag.validation";

const router = Router();

const tagRepository = new MongoTagRepository();

const tagService: ITagService = new TagService(tagRepository);
const tagController = new TagController(tagService);

router.use(asyncHandler((req, res, next) => authMiddleware()(req, res, next)));
router.get(
  "/",
  asyncHandler((req, res) => tagController.getTags(req, res))
);

router.get(
  "/by-ids",
  asyncHandler((req, res) => tagController.getTagsByIds(req, res))
);

router.use(asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)));

router.post(
  "/",
  validate(createTagSchema),
  asyncHandler((req, res, next) => authorizeRoles("user")(req, res, next)),
  asyncHandler((req, res) => tagController.createTag(req, res))
);

router.use( asyncHandler((req, res, next) =>
    authorizeRoles("admin", "superadmin")(req, res, next)
  ))

router.post(
  "/:id/promote",
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
