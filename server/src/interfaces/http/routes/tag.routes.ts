import { Router } from 'express';
import { TagController } from '../controllers/TagController';
import { TagService } from '../../../application/usecases/articles/tag.service';
import { MongoTagRepository } from '../../../infrastructure/repositories/mongodb/tag.repository';
import {  authorizeRoles } from '../middlewares/auth.middleware';
import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();
const tagRepository = new MongoTagRepository();
const tagService = new TagService(tagRepository);
const tagController = new TagController(tagService);

// Public routes
router.get('/', asyncHandler((req, res) => tagController.getTags(req, res)));
router.get('/search', asyncHandler((req, res) => tagController.searchTags(req, res)));
router.get('/:id', asyncHandler((req, res) => tagController.getTag(req, res)));

// Protected routes
// router.use(
//   asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
//   asyncHandler((req, res, next) => csrfMiddleware()(req, res, next))
// );

router.post('/',
  asyncHandler((req, res) => tagController.createTag(req, res))
);

router.delete('/:id',
  asyncHandler((req, res) => tagController.deleteTag(req, res))
);

router.post('/:id/promote',
  asyncHandler((req, res, next) => authorizeRoles('admin', 'superadmin')(req, res, next)),
  asyncHandler((req, res) => tagController.promoteTag(req, res))
);

router.post('/:id/demote',
  asyncHandler((req, res, next) => authorizeRoles('admin', 'superadmin')(req, res, next)),
  asyncHandler((req, res) => tagController.demoteTag(req, res))
);

export default router; 