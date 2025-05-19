import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';
import { ArticleService } from '../../../application/usecases/articles/article.service';
import { MongoArticleRepository } from '../../../infrastructure/repositories/mongodb/article.repository';
import { MongoTagRepository } from '../../../infrastructure/repositories/mongodb/tag.repository';
import { MongoArticleTagRepository } from '../../../infrastructure/repositories/mongodb/article-tag.repository';
import { MongoUserRepository } from '../../../infrastructure/repositories/mongodb/user.repository';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware';
import { csrfMiddleware } from '../middlewares/csrf.middleware';
import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();
const articleRepository = new MongoArticleRepository();
const tagRepository = new MongoTagRepository();
const articleTagRepository = new MongoArticleTagRepository();
const userRepository = new MongoUserRepository();
const articleService = new ArticleService(articleRepository, tagRepository, articleTagRepository, userRepository);
const articleController = new ArticleController(articleService);

// Public routes
router.get('/', asyncHandler((req, res) => articleController.getArticles(req, res)));
router.get('/:id', asyncHandler((req, res) => articleController.getArticle(req, res)));

// Protected routes
router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next))
);

// Get user's articles
router.get('/user/articles', 
  asyncHandler((req, res, next) => authorizeRoles('user', 'admin', 'superadmin')(req, res, next)),
  asyncHandler((req, res) => articleController.getUserArticles(req, res))
);

router.post('/', 
  asyncHandler((req, res, next) => authorizeRoles('user')(req, res, next)),
  asyncHandler((req, res) => articleController.createArticle(req, res))
);

router.put('/:id',
  asyncHandler((req, res, next) => authorizeRoles('user', 'admin', 'superadmin')(req, res, next)),
  asyncHandler((req, res) => articleController.updateArticle(req, res))
);

router.delete('/:id',
  asyncHandler((req, res, next) => authorizeRoles('user', 'admin', 'superadmin')(req, res, next)),
  asyncHandler((req, res) => articleController.deleteArticle(req, res))
);

export default router; 