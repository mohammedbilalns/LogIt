import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { IReportService } from "../../../domain/services/report.service.interface";
import { ReportService } from "../../../application/services/report.service";
import { IUserManagementService } from "../../../domain/services/usermanagement.service.interface";
import { UserManagementService } from "../../../application/services/usermanagement.service";
import { MongoReportRepository } from "../../../infrastructure/repositories/report.repository";
import { MongoArticleRepository } from "../../../infrastructure/repositories/article.repository";
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
const userRepository = new MongoUserRepository();

const userManagementService: IUserManagementService = new UserManagementService(userRepository);
const reportService: IReportService = new ReportService(reportRepository, articleRepository, userManagementService);
const reportController = new ReportController(reportService);

router.use(asyncHandler((req, res, next) => authMiddleware()(req, res, next)));
router.use(asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)));

router.post(
  "/",
  validate(createReportSchema),
	asyncHandler((req,res,next) => authorizeRoles("user")(req,res,next)), 
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
