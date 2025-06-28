import { Request, Response } from "express";
import { ILogService } from "../../../domain/services/log.service.interface";
import { HttpStatus } from "../../../config/statusCodes";
import { HttpResponse } from "../../../config/responseMessages";
import { ResourceLimitExceededError } from "../../../application/errors/resource.errors";

export class LogController {
  constructor(private logService: ILogService) {}

  createLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, content, tags, mediaUrls, createdAt } = req.body;
      const userId = req.user?.id;

      const log = await this.logService.createLog(userId, {
        title,
        content,
        tags,
        mediaUrls,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      });

      res.status(HttpStatus.CREATED).json(log);
    } catch (error) {
      if (error instanceof ResourceLimitExceededError) {
        res.status(HttpStatus.FORBIDDEN).json({
          message: error.message,
          currentPlan: error.subscriptionData?.currentPlan,
          nextPlan: error.subscriptionData?.nextPlan,
          currentUsage: error.subscriptionData?.currentUsage,
          limit: error.subscriptionData?.limit,
          exceededResource: error.subscriptionData?.exceededResource
        });
        return;
      }
      throw error;
    }
  };

  getLogs = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, search, filters, sortBy, sortOrder } = req.query;
    const userId = req.user?.id || "";

    const parsedFilters = filters ? JSON.parse(filters as string) : {};
    const result = await this.logService.getLogs(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      tags: parsedFilters.tagIds,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
    });

    res.status(HttpStatus.OK).json(result);
  };

  getLog = async (req: Request, res: Response): Promise<void> => {
    const { id: logId } = req.params;
    const userId = req.user?.id;

    const log = await this.logService.getLog(userId, logId);

    if (!log) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: HttpResponse.LOG_NOT_FOUND });
      return;
    }
    res.status(HttpStatus.OK).json(log);
  };

  updateLog = async (req: Request, res: Response): Promise<void> => {
    const { id: logId } = req.params;
    const { title, content, tags, mediaUrls, createdAt } = req.body;
    const userId = req.user?.id;

    const updatedLog = await this.logService.updateLog(userId, logId, {
      title,
      content,
      tags,
      mediaUrls,
      createdAt: createdAt ? new Date(createdAt) : undefined,
    });

    if (!updatedLog) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: HttpResponse.LOG_NOT_FOUND });
      return;
    }
    res.status(HttpStatus.OK).json(updatedLog);
  };

  deleteLog = async (req: Request, res: Response): Promise<void> => {
    const { id: logId } = req.params;
    const userId = req.user?.id;

    const success = await this.logService.deleteLog(userId, logId);
    if (!success) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: HttpResponse.LOG_NOT_FOUND });
      return;
    }
    res.status(HttpStatus.OK).send();
  };
}
