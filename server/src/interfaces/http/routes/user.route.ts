import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { IUserService } from "../../../domain/services/user.service.interface";
import { UserService } from "../../../application/usecases/usermanagement/user.service";
import { MongoUserRepository } from "../../../infrastructure/repositories/user.repository";
import { MongoArticleRepository } from "../../../infrastructure/repositories/article.repository";
import { MongoLogRepository } from "../../../infrastructure/repositories/log.repository";
import { BcryptCryptoProvider } from "../../../application/providers/crypto.provider";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../../../application/validations/user.validation";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();

const userRepository = new MongoUserRepository();
const articleRepository = new MongoArticleRepository();
const logRepository = new MongoLogRepository();
const cryptoProvider = new BcryptCryptoProvider();


const userService: IUserService = new UserService(
  userRepository,
  articleRepository,
  logRepository,
  cryptoProvider
);
const userController = new UserController(userService);

router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => authorizeRoles("user")(req, res, next))
);


// Update profile
router.put(
  "/update-profile",
  validate(updateProfileSchema),
  asyncHandler((req, res) => userController.updateProfile(req, res))
);

// Change password
router.put(
  "/change-password",
  validate(changePasswordSchema),
  asyncHandler((req, res) => userController.changePassword(req, res))
);

router.get(
  "/home",
  asyncHandler((req, res) => userController.getHome(req, res))
);

// router.get('/:id', ()=>{
//   console.log("user profile route is called")
// })

// router.post('/:id/follow', ()=>{
//   console.log("Followed user")
// })

// router.post('/:id/unfollow', ()=>{
//   console.log("Unfollowed user")
// })

// router.post('/:id/block',()=>{
//   console.log("blocked user")
// })

// router.post('/:id/unblock', ()=>{
//   console.log('unblocked user')
// })

// router.get('/followers', ()=>{
//   console.log("fetched followers detai")
// })
// router.get('/following', ()=>{
//   console.log('fetched following ')
// })

export default router;
