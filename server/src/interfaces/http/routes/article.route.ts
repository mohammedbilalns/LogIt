import { Router } from "express";
import { ArticleController } from "../controllers/article.controller";
import { IArticleService } from "../../../domain/services/article.service.interface";
import { ArticleService } from "../../../application/usecases/articles/article.service";
import { MongoArticleRepository } from "../../../infrastructure/repositories/article.repository";
import { MongoTagRepository } from "../../../infrastructure/repositories/tag.repository";
import { MongoArticleTagRepository } from "../../../infrastructure/repositories/article-tag.repository";
import { MongoUserRepository } from "../../../infrastructure/repositories/user.repository";
import { MongoReportRepository } from "../../../infrastructure/repositories/report.repository";
import { UserSubscriptionServiceImpl } from "../../../application/usecases/user-subscription/user-subscription.service";
import { UserSubscriptionRepository } from "../../../infrastructure/repositories/user-subscription.repository";
import { MongoSubscriptionRepository } from "../../../infrastructure/repositories/subscription.repository";
import { IUserSubscriptionService } from "../../../domain/services/user-subscription.service.interface";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";
import { validate } from "../middlewares/validation.middleware";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../../../application/validations/article.validation";

const router = Router();

const articleRepository = new MongoArticleRepository();
const tagRepository = new MongoTagRepository();
const articleTagRepository = new MongoArticleTagRepository();
const userRepository = new MongoUserRepository();
const reportRepository = new MongoReportRepository();
const userSubscriptionRepository = new UserSubscriptionRepository();
const subscriptionRepository = new MongoSubscriptionRepository();

const userSubscriptionService: IUserSubscriptionService = new UserSubscriptionServiceImpl(
  userSubscriptionRepository,
  subscriptionRepository
);

const articleService: IArticleService = new ArticleService(
  articleRepository,
  tagRepository,
  articleTagRepository,
  userRepository,
  reportRepository,
  userSubscriptionService
);

const articleController = new ArticleController(articleService);

router.use(asyncHandler((req,res,next) => authMiddleware()(req,res,next)))

router.use(
	asyncHandler((req, res, next) => csrfMiddleware()(req, res, next))
);

router.get(
  "/:id",
  asyncHandler((req, res) => articleController.getArticle(req, res))
);

router.put(
  "/:id",
  validate(updateArticleSchema),
  asyncHandler((req, res) => articleController.updateArticle(req, res))
);

router.use(
  asyncHandler((req, res, next) =>
    authorizeRoles("user")(req, res, next)
  )
);

router.get(
  "/",
  asyncHandler((req, res) => articleController.getArticles(req, res))
);

router.post(
  "/",
  asyncHandler((req, res, next) => authorizeRoles("user")(req, res, next)),
  validate(createArticleSchema),
  asyncHandler((req, res) => articleController.createArticle(req, res))
);

router.delete(
  "/:id",
  asyncHandler((req, res) => articleController.deleteArticle(req, res))
);

export default router;
