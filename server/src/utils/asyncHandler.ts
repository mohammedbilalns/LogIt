import { Request, Response, NextFunction } from "express";

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};