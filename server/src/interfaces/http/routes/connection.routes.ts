import { Router } from "express";
import { MongoConnectionRepository } from "../../../infrastructure/repositories/connection.repository";
import { ConnectionService } from "../../../application/usecases/connections/connections.service";
import { IConnectionService } from "../../../domain/services/connection.service.interface";
import { ConnectionController } from "../controllers/connection.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";
import { validate } from "../middlewares/validation.middleware";
import {
  followUserSchema,
  unfollowUserSchema,
  blockUserSchema,
  unblockUserSchema,
} from "../../../application/validations/connection.validation";

const connectionRepository = new MongoConnectionRepository();
const connectionService: IConnectionService = new ConnectionService(connectionRepository);
const connectionController = new ConnectionController(connectionService);

const router = Router();

router.use(asyncHandler((req, res, next) => authMiddleware()(req, res, next)));
router.use(asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)));

router.get("/followers/:userId", asyncHandler((req, res) => connectionController.fetchFollowers(req, res)));
router.get("/following/:userId", asyncHandler((req, res) => connectionController.fetchFollowing(req, res)));
router.post("/follow", validate(followUserSchema), asyncHandler((req, res) => connectionController.followUser(req, res)));
router.post("/unfollow", validate(unfollowUserSchema), asyncHandler((req, res) => connectionController.unfollowUser(req, res)));
router.post("/block", validate(blockUserSchema), asyncHandler((req, res) => connectionController.blockUser(req, res)));
router.post("/unblock", validate(unblockUserSchema), asyncHandler((req, res) => connectionController.unblockUser(req, res)));

export default router;