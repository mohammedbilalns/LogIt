import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { SubscriptionController } from "../controllers/subscription.controller";
import { MongoSubscriptionRepository } from "../../../infrastructure/repositories/subscription.repository";
import { UserSubscriptionRepository } from "../../../infrastructure/repositories/user-subscription.repository";
import { SubscriptionService } from "../../../application/services/subscription.service";

const router = Router();
const subscriptionRepository = new MongoSubscriptionRepository();
const userSubscriptionRepository = new UserSubscriptionRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository, userSubscriptionRepository);
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
  .post(asyncHandler(controller.createSubscription))
  .patch(asyncHandler(controller.updateSubscription));

router.route('/:id/deactivate')
  .patch(asyncHandler(controller.deActivateSubscription));

export default router;