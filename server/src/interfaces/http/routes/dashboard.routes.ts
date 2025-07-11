import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../../../application/services/dashboard.service';
import { DashboardRepository } from '../../../infrastructure/repositories/dashboard.repository';
import { IDashboardService } from '../../../domain/services/dashboard.service.interface';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware';
import { csrfMiddleware } from '../middlewares/csrf.middleware';
import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();

const dashboardRepository = new DashboardRepository();
const dashboardService: IDashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => authorizeRoles('admin', 'superadmin')(req, res, next))
);

router.get('/stats', asyncHandler((req, res) => dashboardController.getStats(req, res)));
router.post('/chart-data', asyncHandler((req, res) => dashboardController.getChartData(req, res)));

export default router; 