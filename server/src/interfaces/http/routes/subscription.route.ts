import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { SubscriptionController } from "../controllers/subscription.controller";
import { MongoSubscriptionRepository } from "../../../infrastructure/repositories/subscription.repository";
import { UserSubscriptionRepository } from "../../../infrastructure/repositories/user-subscription.repository";
import { SubscriptionService } from "../../../application/services/subscription.service";
import { UserSubscriptionServiceImpl } from "../../../application/services/user-subscription.service";

const router = Router();
const subscriptionRepository = new MongoSubscriptionRepository();
const userSubscriptionRepository = new UserSubscriptionRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository, userSubscriptionRepository);
const controller = new SubscriptionController(subscriptionService);
const userSubscriptionService = new UserSubscriptionServiceImpl(userSubscriptionRepository, subscriptionRepository);

// Authenticated user access for next-plans
router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next))
);

router.get('/next-plans', asyncHandler(async (req, res) => {
  const { resource, currentLimit } = req.query;
  if (!resource || typeof resource !== 'string' || !['articles', 'logs'].includes(resource)) {
    return res.status(400).json({ message: 'Invalid resource type' });
  }
  const limitNum = Number(currentLimit);
  if (isNaN(limitNum)) {
    return res.status(400).json({ message: 'Invalid currentLimit' });
  }
  const plans = await userSubscriptionService.getNextPlans(resource as 'articles' | 'logs', limitNum);
  return res.json(plans);
}));

// Admin-only routes
router.use(
  asyncHandler((req, res, next) => authorizeRoles("admin", "superadmin")(req, res, next))
);

router.route('/')
  .get(asyncHandler(controller.fetchSubscriptions))
  .post(asyncHandler(controller.createSubscription))
  .patch(asyncHandler(controller.updateSubscription));

router.route('/:id/deactivate')
  .patch(asyncHandler(controller.deActivateSubscription));

export default router;