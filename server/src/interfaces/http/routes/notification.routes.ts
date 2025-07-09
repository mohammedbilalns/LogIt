import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { NotificationService } from "../../../application/services/notification.service";
import { MongoNotificationRepository } from "../../../infrastructure/repositories/notification.repository";
import { INotificationService } from "../../../domain/services/notification.service.interface";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();

const notificationRepository = new MongoNotificationRepository();
const notificationService: INotificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => authorizeRoles("user", "admin", "superadmin")(req, res, next))
);

router.get("/", asyncHandler((req, res) => notificationController.getNotifications(req, res)));
router.patch("/mark-all", asyncHandler((req, res) => notificationController.markAllAsRead(req, res)));
router.get("/unread-count", asyncHandler((req, res) => notificationController.getUnreadCount(req, res)));
router.patch("/:id", asyncHandler((req, res) => notificationController.markAsRead(req, res)));

export default router;
