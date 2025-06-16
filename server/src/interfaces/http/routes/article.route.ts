import { Router } from "express";
import { ArticleController } from "../controllers/article.controller";
import { ArticleService } from "../../../application/usecases/articles/article.service";
import { MongoArticleRepository } from "../../../infrastructure/repositories/article.repository";
import { MongoTagRepository } from "../../../infrastructure/repositories/tag.repository";
import { MongoArticleTagRepository } from "../../../infrastructure/repositories/article-tag.repository";
import { MongoUserRepository } from "../../../infrastructure/repositories/user.repository";
import { MongoReportRepository } from "../../../infrastructure/repositories/report.repository";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";
import { validate } from "../middlewares/validation.middleware";
import { createArticleSchema, updateArticleSchema } from "../../../application/validations/article.validation";

const router = Router();

// Repositories
const articleRepository = new MongoArticleRepository();
const tagRepository = new MongoTagRepository();
const articleTagRepository = new MongoArticleTagRepository();
const userRepository = new MongoUserRepository();
const reportRepository = new MongoReportRepository();

const articleService = new ArticleService(
  articleRepository,
  tagRepository,
  articleTagRepository,
  userRepository,
  reportRepository
);

const articleController = new ArticleController(articleService);

// Public routes
router.get(
  "/",
  asyncHandler((req,res)=> articleController.getArticles(req,res))
);

// Protected routes
router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next))
);

router.get(
  "/:id",
  asyncHandler((req, res) => articleController.getArticle(req, res))
);

router.post(
  "/",
  asyncHandler((req, res, next) => authorizeRoles("user")(req, res, next)),
  validate(createArticleSchema),
  asyncHandler((req, res) => articleController.createArticle(req, res))
);

router.put(
  "/:id",
  asyncHandler((req, res, next) =>
    authorizeRoles("user", "admin", "superadmin")(req, res, next)
  ),
  validate(updateArticleSchema),
  asyncHandler((req, res) => articleController.updateArticle(req, res))
);

router.delete(
  "/:id",
  asyncHandler((req, res, next) =>
    authorizeRoles("user", "admin", "superadmin")(req, res, next)
  ),
  asyncHandler((req, res) => articleController.deleteArticle(req, res))
);

export default router;
