import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { ReportService } from '../../../application/usecases/reports/report.service';
import { MongoReportRepository } from '../../../infrastructure/repositories/report.repository';
import { asyncHandler } from '../../../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { csrfMiddleware } from '../middlewares/csrf.middleware';

const router = Router();

const reportRepository = new MongoReportRepository();
const reportService = new ReportService(reportRepository);
const reportController = new ReportController(reportService);

// Apply auth and csrf middleware to all report routes
router.use(asyncHandler((req, res, next) => authMiddleware()(req, res, next)));
router.use(asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)));

// Route to create a new report
router.post('/', asyncHandler((req, res) => reportController.createReport(req, res)));

export default router; 