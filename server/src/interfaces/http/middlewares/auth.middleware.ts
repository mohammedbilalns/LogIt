import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../../../config/env";
import { IAuthCheckService } from "../../../domain/services/auth-check.service.interface";
import { AuthCheckService } from "../../../application/usecases/auth/auth-check.service";
import { MongoUserRepository } from "../../../infrastructure/repositories/user.repository";
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

export const createAuthMiddleware = (
  authCheckService: IAuthCheckService,
  jwtSecret: string = env.JWT_SECRET
) => {
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
        await authCheckService.checkUserBlocked(userId);
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

export const authMiddleware = (jwtSecret: string = env.JWT_SECRET) => {
  const userRepository = new MongoUserRepository();
  const authCheckService: IAuthCheckService = new AuthCheckService(
    userRepository
  );

  return createAuthMiddleware(authCheckService, jwtSecret);
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
