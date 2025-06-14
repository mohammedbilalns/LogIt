import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger";
import { HttpStatus } from "../../../config/statusCodes";

export const errorMiddleware = () => {
  return (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err) {
      logger.cyan("Middleware", "Error middleware");

      logger.red("Error", err instanceof Error ? err.message : "Unknown error");
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
        err instanceof Error ? err.message : "Something went wrong";

      res.status(statusCode).json({ message });
    } else {
      next();
    }
  };
};
