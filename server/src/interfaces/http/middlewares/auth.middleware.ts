import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../../../config/env";
import { UserService } from "../../../application/usecases/usermanagement/user.service";
import { HttpStatus } from "../../../config/statusCodes";

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
  const userService = new UserService();

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
          .json({ message: "Authentication required" });
        return;
      }

      // Verify access token
      const decoded = jwt.verify(token, jwtSecret) as {
        id: string;
        email: string;
        role: "user" | "admin" | "superadmin";
      };

      try {
        // Check if user is blocked
        await userService.checkUserBlocked(decoded.id);
        req.user = decoded;
        next();
      } catch (error) {
        if (error instanceof Error) {
          // Clear authentication cookies
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

          res.status(HttpStatus.FORBIDDEN).json({ message: "User is blocked" });
          return;
        }
        throw error;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "INvalid or expired token ";
      res.status(HttpStatus.FORBIDDEN).json({ message });
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
        .json({ message: "Unauthorized: No user found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({
          message:
            "Forbidden: You do not have permission to access this resource",
        });
    }

    return next();
  };
};
