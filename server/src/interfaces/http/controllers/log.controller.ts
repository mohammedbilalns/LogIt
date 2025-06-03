import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { LogService } from '../../../application/usecases/logs/log.service';
import { MongoLogRepository } from '../../../infrastructure/repositories/MongoLogRepository';
import { MongoLogTagRepository } from '../../../infrastructure/repositories/MongoLogTagRepository';
import { MongoLogMediaRepository } from '../../../infrastructure/repositories/MongoLogMediaRepository';
import { logger } from '../../../utils/logger';

export class LogController {
  private logService: LogService;

  constructor() {
    const logRepository = new MongoLogRepository();
    const logTagRepository = new MongoLogTagRepository();
    const logMediaRepository = new MongoLogMediaRepository();
    this.logService = new LogService(logRepository, logTagRepository, logMediaRepository);
  }

  createLog = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { title, content, tags, mediaUrls } = req.body;
      const userId = req.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const log = await this.logService.createLog(userId, { title, content, tags, mediaUrls });
      return res.status(201).json(log);
    } catch (error) {
      logger.red('CREATE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to create log');
      return res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create log' });
    }
  });

  getLogs = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { page, limit, search, tags } = req.query;
      const userId = req.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const result = await this.logService.getLogs(userId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : undefined
      });

      return res.json(result);
    } catch (error) {
      logger.red('GET_LOGS_ERROR', error instanceof Error ? error.message : 'Failed to get logs');
      return res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to get logs' });
    }
  });

  updateLog = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, content, tags, mediaUrls } = req.body;
      const userId = req.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const updatedLog = await this.logService.updateLog(userId, id, { title, content, tags, mediaUrls });
      if (!updatedLog) {
        return res.status(404).json({ message: 'Log not found' });
      }
      return res.json(updatedLog);
    } catch (error) {
      logger.red('UPDATE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to update log');
      return res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update log' });
    }
  });

  deleteLog = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const success = await this.logService.deleteLog(userId, id);
      if (!success) {
        return res.status(404).json({ message: 'Log not found' });
      }
      return res.status(204).send();
    } catch (error) {
      logger.red('DELETE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to delete log');
      return res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to delete log' });
    }
  });
} 