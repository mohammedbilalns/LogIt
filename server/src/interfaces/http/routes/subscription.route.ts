import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware";
import { csrfMiddleware } from "../middlewares/csrf.middleware";

const router = Router();

router.use(
  asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
  asyncHandler((req, res, next) => csrfMiddleware()(req, res, next)),
  asyncHandler((req, res, next) =>
    authorizeRoles("admin", "superadmin")(req, res, next)
  )
);

router.route('/')
        .get(()=>{
            console.log("get")
        })
        .post(()=>{
            console.log("post")
        })
        .patch(()=>{
            console.log("patch")
        })
        .delete(()=>{
            console.log("delete")
        })


export default router