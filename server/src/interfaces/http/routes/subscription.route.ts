import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { SubscriptionController } from "../controllers/subscription.controller";
import { MongoSubscriptionRepository } from "../../../infrastructure/repositories/subscription.repository";
import { SubscriptionService } from "../../../application/usecases/subscription/subscription.service";

const router = Router();
const subscriptionRepository = new MongoSubscriptionRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository);
const controller = new SubscriptionController(subscriptionService);

router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)),
  asyncHandler((req, res, next) =>
    authorizeRoles("admin", "superadmin")(req, res, next)
  )
);

router.route('/')
  .get(asyncHandler(controller.fetchSubscriptions))
  .patch(asyncHandler(controller.updateSubscription));

export default router;