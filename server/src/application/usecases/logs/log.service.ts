import { Log } from '../../../domain/entities/Log';
import { LogRepository } from '../../../domain/repositories/log.repository';
import { LogTagRepository } from '../../../domain/repositories/logTag.repository';
import { LogMediaRepository } from '../../../domain/repositories/logMedia.repository';
import { logger } from '../../../utils/logger';
import { ITagRepository } from '../../../domain/repositories/tag.repository.interface';
import { Tag } from '../../../domain/entities/tag.entity';
import { LogTag } from '../../../domain/entities/LogTag';

interface CreateLogData {
  title: string;
  content: string;
  tags?: string[];
  mediaUrls?: string[];
  createdAt?: Date;
}

interface UpdateLogData {
  title: string;
  content: string;
  tags?: string[];
  mediaUrls?: string[];
  createdAt?: Date;
}

interface GetLogsOptions {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TagWithName {
  id: string;
  name: string;
}

interface LogWithRelations extends Log {
  tags: TagWithName[];
  mediaUrls: string[];
}

export class LogService {
  constructor(
    private logRepository: LogRepository,
    private logTagRepository: LogTagRepository,
    private logMediaRepository: LogMediaRepository,
    private tagRepository: ITagRepository
  ) {}

  async createLog(userId: string, data: CreateLogData): Promise<LogWithRelations> {
    try {
      const log = await this.logRepository.create({
        userId,
        title: data.title,
        content: data.content,
      });

      if (!log.id) {
        throw new Error('Failed to create log: missing id');
      }

      const logId = log.id;

      if (data.tags && data.tags.length > 0) {
        for (const tagId of data.tags) {
          const tag = await this.tagRepository.findById(tagId);
          if (tag) {
            await this.logTagRepository.create({
              logId,
              tagId,
              userId,
              createdAt: new Date()
            } as Omit<LogTag, 'id'>);
            await this.tagRepository.incrementUsageCount(tagId);
          }
        }
      }

      if (data.mediaUrls && data.mediaUrls.length > 0) {
        await this.logMediaRepository.createMany(
          data.mediaUrls.map(url => ({
            logId,
            url,
            userId,
            createdAt: new Date(),
          }))
        );
      }

      const logWithRelations = await this.getLogWithRelations(logId);
      if (!logWithRelations) {
        throw new Error('Failed to create log with relations');
      }
      return logWithRelations;
    } catch (error) {
      logger.red('CREATE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to create log');
      throw error;
    }
  }

  async getLogs(userId: string, options: GetLogsOptions): Promise<{ logs: LogWithRelations[]; total: number }> {
    try {
      const logs = await this.logRepository.findMany(userId, options);
      const total = await this.logRepository.countLogs(userId, options);

      const logIds = logs.map(log => {
        if (!log.id) {
          throw new Error('Log missing id');
        }
        return log.id;
      });

      const [tags, media] = await Promise.all([
        this.logTagRepository.findByLogIds(logIds),
        this.logMediaRepository.findByLogIds(logIds),
      ]);

      // Get all unique tag IDs
      const tagIds = [...new Set(tags.map(tag => tag.tagId))];
      const tagDetails = await Promise.all(
        tagIds.map(id => this.tagRepository.findById(id))
      );
      const tagMap = new Map(
        tagDetails
          .filter((tag): tag is Tag => tag !== null)
          .map(tag => [tag.id || '', tag.name])
      );

      const logsWithRelations = logs.map(log => {
        if (!log.id) {
          throw new Error('Log missing id');
        }
        const logId = log.id;
        return {
          ...log,
          tags: tags
            .filter(tag => tag.logId === logId)
            .map(tag => ({
              id: tag.tagId,
              name: tagMap.get(tag.tagId) || 'Unknown Tag'
            })),
          mediaUrls: media
            .filter(m => m.logId === logId)
            .map(m => m.url),
        };
      });

      return {
        logs: logsWithRelations,
        total,
      };
    } catch (error) {
      logger.red('GET_LOGS_ERROR', error instanceof Error ? error.message : 'Failed to get logs');
      throw error;
    }
  }

  async getLog(userId: string, logId: string): Promise<LogWithRelations | null> {
    try {
      const log = await this.logRepository.findById(logId);
      if (!log || log.userId !== userId) {
        return null;
      }

      if (!log.id) {
        throw new Error('Log missing id');
      }

      const [tags, media] = await Promise.all([
        this.logTagRepository.findByLogId(logId),
        this.logMediaRepository.findByLogId(logId),
      ]);

      // Get tag details
      const tagIds = tags.map(tag => tag.tagId);
      const tagDetails = await Promise.all(
        tagIds.map(id => this.tagRepository.findById(id))
      );
      const tagMap = new Map(
        tagDetails
          .filter((tag): tag is Tag => tag !== null)
          .map(tag => [tag.id || '', tag.name])
      );

      return {
        ...log,
        tags: tags.map(tag => ({
          id: tag.tagId,
          name: tagMap.get(tag.tagId) || 'Unknown Tag'
        })),
        mediaUrls: media.map(m => m.url),
      };
    } catch (error) {
      logger.red('GET_LOG_ERROR', error instanceof Error ? error.message : 'Failed to get log');
      throw error;
    }
  }

  async updateLog(userId: string, logId: string, data: UpdateLogData): Promise<LogWithRelations | null> {
    try {
      const log = await this.logRepository.findById(logId);
      if (!log || log.userId !== userId) {
        return null;
      }

      if (!log.id) {
        throw new Error('Log missing id');
      }

      await this.logRepository.update(logId, {
        title: data.title,
        content: data.content,
        ...(data.createdAt && { createdAt: data.createdAt }),
      });

      if (data.tags) {
        const existingTags = await this.logTagRepository.findByLogId(logId);
        for (const tag of existingTags) {
          await this.tagRepository.decrementUsageCount(tag.tagId);
        }

        await this.logTagRepository.deleteByLogId(logId);

        if (data.tags.length > 0) {
          for (const tagId of data.tags) {
            const tag = await this.tagRepository.findById(tagId);
            if (tag) {
              await this.logTagRepository.create({
                logId,
                tagId,
                userId,
                createdAt: new Date()
              } as Omit<LogTag, 'id'>);
              await this.tagRepository.incrementUsageCount(tagId);
            }
          }
        }
      }

      if (data.mediaUrls) {
        await this.logMediaRepository.deleteByLogId(logId);
        if (data.mediaUrls.length > 0) {
          await this.logMediaRepository.createMany(
            data.mediaUrls.map(url => ({
              logId,
              url,
              userId,
              createdAt: new Date(),
            }))
          );
        }
      }

      return this.getLogWithRelations(logId);
    } catch (error) {
      logger.red('UPDATE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to update log');
      throw error;
    }
  }

  async deleteLog(userId: string, logId: string): Promise<boolean> {
    try {
      const log = await this.logRepository.findById(logId);
      if (!log || log.userId !== userId) {
        return false;
      }

      const logTags = await this.logTagRepository.findByLogId(logId);
      for (const tag of logTags) {
        await this.tagRepository.decrementUsageCount(tag.tagId);
      }

      await Promise.all([
        this.logRepository.delete(logId),
        this.logTagRepository.deleteByLogId(logId),
        this.logMediaRepository.deleteByLogId(logId),
      ]);

      return true;
    } catch (error) {
      logger.red('DELETE_LOG_ERROR', error instanceof Error ? error.message : 'Failed to delete log');
      throw error;
    }
  }

  private async getLogWithRelations(logId: string): Promise<LogWithRelations | null> {
    const log = await this.logRepository.findById(logId);
    if (!log) return null;

    if (!log.id) {
      throw new Error('Log missing id');
    }

    const [tags, media] = await Promise.all([
      this.logTagRepository.findByLogId(logId),
      this.logMediaRepository.findByLogId(logId),
    ]);

    // Get tag details
    const tagIds = tags.map(tag => tag.tagId);
    const tagDetails = await Promise.all(
      tagIds.map(id => this.tagRepository.findById(id))
    );
    const tagMap = new Map(
      tagDetails
        .filter((tag): tag is Tag => tag !== null)
        .map(tag => [tag.id || '', tag.name])
    );

    return {
      ...log,
      tags: tags.map(tag => ({
        id: tag.tagId,
        name: tagMap.get(tag.tagId) || 'Unknown Tag'
      })),
      mediaUrls: media.map(m => m.url),
    };
  }
} 