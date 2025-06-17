import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../../../config/env";
import { UserService } from "../../../application/usecases/usermanagement/user.service";
import { MongoUserRepository } from "../../../infrastructure/repositories/user.repository";
import { MongoArticleRepository } from "../../../infrastructure/repositories/article.repository";
import { MongoLogRepository } from "../../../infrastructure/repositories/log.repository";
import { BcryptCryptoProvider } from "../../../application/providers/crypto.provider";
import { HttpStatus } from "../../../config/statusCodes";
import { HttpResponse } from "../../../config/responseMessages";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: "user" | "admin" | "superadmin";
    };
  }
}

export const authMiddleware = (jwtSecret: string = env.JWT_SECRET) => {
  const userRepository = new MongoUserRepository();
  const articleRepository = new MongoArticleRepository();
  const logRepository = new MongoLogRepository();
  const cryptoProvider = new BcryptCryptoProvider();
  
  const userService = new UserService(
    userRepository,
    articleRepository,
    logRepository,
    cryptoProvider
  );

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.cookies.accessToken;

      if (!token) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: HttpResponse.AUTHENTICATION_REQUIRED });
        return;
      }

      // Verify access token
      const decoded = jwt.verify(token, jwtSecret) as {
        id: string;
        email: string;
        role: "user" | "admin" | "superadmin";
      };

      try {
        const { id: userId } = decoded;
        await userService.checkUserBlocked(userId);
        req.user = decoded;
        next();
      } catch (error) {
        if (error instanceof Error) {
          res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          res.clearCookie("csrfToken", {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });

          res
            .status(HttpStatus.FORBIDDEN)
            .json({ message: HttpResponse.USER_BLOCKED });
          return;
        }
        throw error;
      }
    } catch (error) {
      res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: error?.message || HttpResponse.INVALID_TOKEN });
      return;
    }
  };
};

export const authorizeRoles = (
  ...allowedRoles: ("user" | "admin" | "superadmin")[]
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: HttpResponse.USER_NOT_FOUND });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: HttpResponse.FORBIDDEN_RESOURCE,
      });
    }

    return next();
  };
};
