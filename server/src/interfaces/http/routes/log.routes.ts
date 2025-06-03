import { Router } from 'express';
import { LogController } from '../controllers/log.controller';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware';
import { csrfMiddleware } from '../middlewares/csrf.middleware';
import { asyncHandler } from 'src/utils/asyncHandler';
const router = Router();
const logController = new LogController();

router.use(asyncHandler((req,res,next)=> authMiddleware()(req,res,next)))
router.use(asyncHandler((req,res,next)=> authorizeRoles('user')(req,res,next)))

router.get('/', logController.getLogs);
router.get('/:id', logController.getLog);

router.use(asyncHandler((req,res,next)=> csrfMiddleware()(req,res,next)))
router.post('/', logController.createLog);
router.put('/:id', logController.updateLog);
router.delete('/:id', logController.deleteLog);

export default router; 