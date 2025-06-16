import { Request, Response } from "express";
import { LogService } from "../../../application/usecases/logs/log.service";
import { HttpStatus } from "../../../config/statusCodes";
import { HttpResponse } from "../../../config/responseMessages";

export class LogController {
  constructor(private logService: LogService) {}

  createLog = async (req: Request, res: Response): Promise<void> => {
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
    const { id } = req.params;
    const userId = req.user?.id;


    const log = await this.logService.getLog(userId, id);

    if (!log) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: HttpResponse.LOG_NOT_FOUND });
      return;
    }
    res.status(HttpStatus.OK).json(log);
  };

  updateLog = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, content, tags, mediaUrls, createdAt } = req.body;
    const userId = req.user?.id;

    const updatedLog = await this.logService.updateLog(userId, id, {
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
    const { id } = req.params;
    const userId = req.user?.id;


    const success = await this.logService.deleteLog(userId, id);
    if (!success) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: HttpResponse.LOG_NOT_FOUND });
      return;
    }
    res.status(HttpStatus.OK).send();
  };
}
