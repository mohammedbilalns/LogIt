import { Router } from 'express';
import { CallController } from '../controllers/call.controller';
import { CallService } from '../../../application/services/call.service';
import { CallRepository } from '../../../infrastructure/repositories/call.repository';
import { CallEventRepository } from '../../../infrastructure/repositories/call-event.repository';
import { authMiddleware } from '../middlewares/auth.middleware';
import { csrfMiddleware } from '../middlewares/csrf.middleware';
import { asyncHandler } from '../../../utils/asyncHandler';
import { Server } from 'socket.io';

export function createCallRouter(io: Server) {
  const router = Router();

  const callRepository = new CallRepository();
  const callEventRepository = new CallEventRepository();
  const callService = new CallService(callRepository, callEventRepository, io);
  const callController = new CallController(callService);

  router.use(
    asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
    asyncHandler((req, res, next) => csrfMiddleware()(req, res, next))
  );

  router.post('/log', asyncHandler((req, res) => callController.createCallLog(req, res)));

  router.patch('/log/:callId', asyncHandler((req, res) => callController.updateCallLog(req, res)));

  router.get('/history', asyncHandler((req, res) => callController.getCallHistory(req, res)));

  router.post('/event', asyncHandler((req, res) => callController.emitCallEvent(req, res)));

  return router;
} 