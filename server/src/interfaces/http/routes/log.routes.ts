import { Router } from "express";
import { LogController } from "../controllers/log.controller";
import { LogService } from "../../../application/usecases/logs/log.service";
import { MongoLogRepository } from "../../../infrastructure/repositories/log.repository";
import { MongoLogTagRepository } from "../../../infrastructure/repositories/log-tag.repository";
import { MongoLogMediaRepository } from "../../../infrastructure/repositories/log-media.repository";
import { MongoTagRepository } from "../../../infrastructure/repositories/tag.repository";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  createLogSchema,
  updateLogSchema,
} from "../../../application/validations/log.validation";

const router = Router();

const logRepository = new MongoLogRepository();
const logTagRepository = new MongoLogTagRepository();
const logMediaRepository = new MongoLogMediaRepository();
const tagRepository = new MongoTagRepository();

const logService = new LogService(
  logRepository,
  logTagRepository,
  logMediaRepository,
  tagRepository
);

const logController = new LogController(logService);

router.use(asyncHandler((req, res, next) => authMiddleware()(req, res, next)));
router.use(asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)));
router.use(
  asyncHandler((req, res, next) => authorizeRoles("user")(req, res, next))
);

// Get all logs
router.get(
  "/",
  asyncHandler((req, res) => logController.getLogs(req, res))
);

// Get a single log
router.get(
  "/:id",
  asyncHandler((req, res) => logController.getLog(req, res))
);

// Create a new log
router.post(
  "/",
  validate(createLogSchema),
  asyncHandler((req, res) => logController.createLog(req, res))
);

// Update a log
router.put(
  "/:id",
  validate(updateLogSchema),
  asyncHandler((req, res) => logController.updateLog(req, res))
);

// Delete a log
router.delete(
  "/:id",
  asyncHandler((req, res) => logController.deleteLog(req, res))
);

export default router;
