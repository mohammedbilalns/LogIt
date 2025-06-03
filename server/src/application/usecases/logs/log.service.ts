import { Log } from '../../../domain/entities/Log';
import { LogRepository } from '../../../domain/repositories/LogRepository';
import { LogTagRepository } from '../../../domain/repositories/LogTagRepository';
import { LogMediaRepository } from '../../../domain/repositories/LogMediaRepository';
import { logger } from '../../../utils/logger';

export class LogService {
  constructor(
    private logRepository: LogRepository,
    private logTagRepository: LogTagRepository,
    private logMediaRepository: LogMediaRepository
  ) {}

  async createLog(userId: string, data: { title: string; content: string; tags?: string[]; mediaUrls?: string[] }): Promise<Log> {
    try {
      const log = await this.logRepository.create({
        id: '',
        userId,
        title: data.title,
        content: data.content,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (data.tags?.length) {
        await Promise.all(data.tags.map(tag => 
          this.logTagRepository.create({
            id: '', 
            logId: log.id,
            tag
          })
        ));
      }

      if (data.mediaUrls?.length) {
        await Promise.all(data.mediaUrls.map(url =>
          this.logMediaRepository.create({
            id: '', 
            logId: log.id,
            url
          })
        ));
      }

      return log;
    } catch (error) {
      logger.red('CREATE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to create log');
      throw error;
    }
  }

  async getLogs(userId: string, filters: { page?: number; limit?: number; search?: string; tags?: string[] }) {
    try {
      const { page = 1, limit = 10, search, tags } = filters;
      const skip = (page - 1) * limit;

      const logs = await this.logRepository.findByUserId(userId);
      const total = logs.length;

      let filteredLogs = logs;
      if (search) {
        filteredLogs = logs.filter(log => 
          log.title.toLowerCase().includes(search.toLowerCase()) ||
          log.content.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (tags?.length) {
        const logIds = await Promise.all(
          tags.map(async (tag) => {
            const logTags = await this.logTagRepository.findByLogId(tag);
            return logTags.map(lt => lt.logId);
          })
        );
        const uniqueLogIds = [...new Set(logIds.flat())];
        filteredLogs = filteredLogs.filter(log => uniqueLogIds.includes(log.id));
      }

      const logsWithDetails = await Promise.all(
        filteredLogs.slice(skip, skip + limit).map(async (log) => {
          const logTags = await this.logTagRepository.findByLogId(log.id);
          const logMedia = await this.logMediaRepository.findByLogId(log.id);
          return {
            ...log,
            tags: logTags.map(lt => lt.tag),
            media: logMedia.map(lm => lm.url)
          };
        })
      );

      return {
        logs: logsWithDetails,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.red('GET_LOGS_ERROR', error instanceof Error ? error.message : 'Failed to get logs');
      throw error;
    }
  }

  async updateLog(userId: string, logId: string, data: { title: string; content: string; tags?: string[]; mediaUrls?: string[] }): Promise<Log | null> {
    try {
      const existingLog = await this.logRepository.findById(logId);
      if (!existingLog || existingLog.userId !== userId) {
        throw new Error('Log not found');
      }

      const updatedLog = await this.logRepository.update({
        ...existingLog,
        title: data.title,
        content: data.content,
        updatedAt: new Date()
      });

      await this.logTagRepository.deleteByLogId(logId);
      if (data.tags?.length) {
        await Promise.all(data.tags.map(tag =>
          this.logTagRepository.create({
            id: '', 
            logId,
            tag
          })
        ));
      }

      await this.logMediaRepository.deleteByLogId(logId);
      if (data.mediaUrls?.length) {
        await Promise.all(data.mediaUrls.map(url =>
          this.logMediaRepository.create({
            id: '', 
            logId,
            url
          })
        ));
      }

      return updatedLog;
    } catch (error) {
      logger.red('UPDATE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to update log');
      throw error;
    }
  }

  async deleteLog(userId: string, logId: string): Promise<boolean> {
    try {
      const existingLog = await this.logRepository.findById(logId);
      if (!existingLog || existingLog.userId !== userId) {
        throw new Error('Log not found');
      }

      await this.logTagRepository.deleteByLogId(logId);
      await this.logMediaRepository.deleteByLogId(logId);
      return await this.logRepository.delete(logId);
    } catch (error) {
      logger.red('DELETE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to delete log');
      throw error;
    }
  }
} 