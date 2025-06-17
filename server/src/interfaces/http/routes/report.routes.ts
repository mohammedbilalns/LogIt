import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { ReportService } from "../../../application/usecases/reports/report.service";
import { MongoReportRepository } from "../../../infrastructure/repositories/report.repository";
import { ArticleService } from "../../../application/usecases/articles/article.service";
import { MongoArticleRepository } from "../../../infrastructure/repositories/article.repository";
import { MongoTagRepository } from "../../../infrastructure/repositories/tag.repository";
import { MongoArticleTagRepository } from "../../../infrastructure/repositories/article-tag.repository";
import { MongoUserRepository } from "../../../infrastructure/repositories/user.repository";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  createReportSchema,
  updateReportStatusSchema,
} from "../../../application/validations/report.validation";

const router = Router();

const reportRepository = new MongoReportRepository();
const articleRepository = new MongoArticleRepository();
const tagRepository = new MongoTagRepository();
const articleTagRepository = new MongoArticleTagRepository();
const userRepository = new MongoUserRepository();

const articleService = new ArticleService(
  articleRepository,
  tagRepository,
  articleTagRepository,
  userRepository,
  reportRepository
);
const reportService = new ReportService(reportRepository, articleService);
const reportController = new ReportController(reportService);

router.use(asyncHandler((req, res, next) => authMiddleware()(req, res, next)));
router.use(asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)));

router.post(
  "/",
  validate(createReportSchema),
  asyncHandler((req, res) => reportController.createReport(req, res))
);

router.use(
  asyncHandler((req, res, next) =>
    authorizeRoles("admin", "superadmin")(req, res, next)
  )
);

// Get all reports
router.get(
  "/",
  asyncHandler((req, res) => reportController.getReports(req, res))
);

// Update report status
router.patch(
  "/:id/status",
  validate(updateReportStatusSchema),
  asyncHandler((req, res) => reportController.updateReportStatus(req, res))
);

// Block article
router.post(
  "/block-article/:articleId",
  asyncHandler((req, res) => reportController.blockArticle(req, res))
);

export default router;
