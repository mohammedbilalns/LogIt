import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../../constants/statusCodes";
import { HttpResponse } from "../../../constants/responseMessages";
import { logger } from "../../../utils/logger";

export const errorMiddleware = () => {
  return (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err) {
      function hasStatusCode(error: unknown): error is { statusCode: number } {
        return (
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof (error as { statusCode?: unknown }).statusCode === "number"
        );
      }
      const statusCode = hasStatusCode(err)
        ? err.statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        err instanceof Error ? err.message : HttpResponse.INTERNAL_ERROR;
      logger.red("Error", message);
      res.status(statusCode).json({ message });
    } else {
      next();
    }
  };
};
