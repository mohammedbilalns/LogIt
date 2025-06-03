import { Request, Response } from 'express';
import { LogService } from '../../../application/usecases/logs/log.service';
import { logger } from '../../../utils/logger';

export class LogController {
  constructor(private logService: LogService) {}

  createLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, content, tags, mediaUrls, createdAt } = req.body;
      const userId = req.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const log = await this.logService.createLog(userId, {
        title,
        content,
        tags,
        mediaUrls,
        createdAt: createdAt ? new Date(createdAt) : new Date()
      });

      res.status(201).json(log);
    } catch (error) {
      logger.red('CREATE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to create log');
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create log' });
    }
  };

  getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, search, tags, sortBy, sortOrder } = req.query;
      const userId = req.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const result = await this.logService.getLogs(userId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      res.json(result);
    } catch (error) {
      logger.red('GET_LOGS_ERROR', error instanceof Error ? error.message : 'Failed to get logs');
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to get logs' });
    }
  };

  getLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const log = await this.logService.getLog(userId, id);
      if (!log) {
        res.status(404).json({ message: 'Log not found' });
        return;
      }
      res.json(log);
    } catch (error) {
      logger.red('GET_LOG_ERROR', error instanceof Error ? error.message : 'Failed to get log');
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to get log' });
    }
  };

  updateLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content, tags, mediaUrls, createdAt } = req.body;
      const userId = req.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const updatedLog = await this.logService.updateLog(userId, id, {
        title,
        content,
        tags,
        mediaUrls,
        createdAt: createdAt ? new Date(createdAt) : undefined
      });

      if (!updatedLog) {
        res.status(404).json({ message: 'Log not found' });
        return;
      }
      res.json(updatedLog);
    } catch (error) {
      logger.red('UPDATE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to update log');
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update log' });
    }
  };

  deleteLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const success = await this.logService.deleteLog(userId, id);
      if (!success) {
        res.status(404).json({ message: 'Log not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      logger.red('DELETE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to delete log');
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to delete log' });
    }
  };
} 