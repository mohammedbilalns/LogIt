import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { HttpStatus } from "../../../constants/statusCodes";
import { logger } from "../../../utils/logger";

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map((err) => err.message).join(", ");
        logger.red("validation error", errorMessage);
        res.status(HttpStatus.BAD_REQUEST).json({
          message: errorMessage,
        });
      } else {
        next(error);
      }
    }
  };
};
