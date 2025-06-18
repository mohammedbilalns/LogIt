import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { HttpStatus } from "../../../config/statusCodes";
import { HttpResponse } from "../../../config/responseMessages";

const generateToken = () => crypto.randomBytes(32).toString("hex");

export const csrfMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return next();
    }

    const csrfToken = req.headers["x-csrf-token"];
    const storedToken = req.cookies["csrfToken"];
    if (!csrfToken || !storedToken || csrfToken !== storedToken) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: HttpResponse.INVALID_CSRF_TOKEN });
    }

    next();
  };
};

export const setCsrfToken = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = generateToken();
  res.cookie("csrfToken", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.setHeader("x-csrf-token", token);
  next();
};
