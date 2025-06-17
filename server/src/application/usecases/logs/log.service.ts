import { ILogRepository } from "../../../domain/repositories/log.repository";
import { ILogTagRepository } from "../../../domain/repositories/logTag.repository";
import { ILogMediaRepository } from "../../../domain/repositories/logMedia.repository";
import { ITagRepository } from "../../../domain/repositories/tag.repository.interface";
import { Tag } from "../../../domain/entities/tag.entity";
import { LogTag } from "../../../domain/entities/log-tag.entity";
import { UnauthorizedError } from "../../errors/auth.errors";
import { InternalServerError } from "../../errors/internal.errors";
import { HttpResponse } from "../../../config/responseMessages";
import {
  CreateLogData,
  UpdateLogData,
  GetLogsOptions,
  LogWithRelations,
} from "../../dtos";

export class LogService {
  constructor(
    private logRepository: ILogRepository,
    private logTagRepository: ILogTagRepository,
    private logMediaRepository: ILogMediaRepository,
    private tagRepository: ITagRepository
  ) {}

  async createLog(
    userId: string | undefined,
    data: CreateLogData
  ): Promise<LogWithRelations> {
    try {
    
      if (!userId) {
        throw new UnauthorizedError();
      }
      const log = await this.logRepository.create({
        userId,
        title: data.title,
        content: data.content,
      });

      if (!log.id) {
        throw new InternalServerError(HttpResponse.LOG_ID_NOT_FOUND);
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
              createdAt: new Date(),
            } as Omit<LogTag, "id">);
            await this.tagRepository.incrementUsageCount(tagId);
          }
        }
      }

      if (data.mediaUrls && data.mediaUrls.length > 0) {
        await this.logMediaRepository.createMany(
          data.mediaUrls.map((url) => ({
            logId,
            url,
            userId,
            createdAt: new Date(),
          }))
        );
      }

      const logWithRelations = await this.getLogWithRelations(logId);
      if (!logWithRelations) {
        throw new InternalServerError();
      }
      return logWithRelations;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_CREATE_LOG;
      throw new InternalServerError(message);
    }
  }

  async getLogs(
    userId: string,
    options: GetLogsOptions
  ): Promise<{ logs: LogWithRelations[]; total: number }> {
    try {
      const logs = await this.logRepository.findMany(userId, options);
      const total = await this.logRepository.countLogs(userId, options);

      const logIds = logs.map((log) => {
        if (!log.id) {
          throw new InternalServerError(HttpResponse.LOG_ID_NOT_FOUND);
        }
        return log.id;
      });

      const [tags, media] = await Promise.all([
        this.logTagRepository.findByLogIds(logIds),
        this.logMediaRepository.findByLogIds(logIds),
      ]);

      // Get all  tag IDs
      const tagIds = [...new Set(tags.map((tag) => tag.tagId))];
      const tagDetails = await Promise.all(
        tagIds.map((id) => this.tagRepository.findById(id))
      );
      const tagMap = new Map(
        tagDetails
          .filter((tag): tag is Tag => tag !== null)
          .map((tag) => [tag.id || "", tag.name])
      );

      const logsWithRelations = logs.map((log) => {
        if (!log.id) {
          throw new InternalServerError(HttpResponse.LOG_ID_NOT_FOUND);
        }
        const logId = log.id;
        return {
          ...log,
          tags: tags
            .filter((tag) => tag.logId === logId)
            .map((tag) => ({
              id: tag.tagId,
              name: tagMap.get(tag.tagId) || "Unknown Tag",
            })),
          mediaUrls: media.filter((m) => m.logId === logId).map((m) => m.url),
        };
      });

      return {
        logs: logsWithRelations,
        total,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_FETCH_LOG;
      throw new InternalServerError(message);
    }
  }

  async getLog(
    userId: string | undefined,
    logId: string
  ): Promise<LogWithRelations | null> {
    try {
      console.log("User id ", userId)
      if (!userId) {
        throw new UnauthorizedError();
      }

      const log = await this.logRepository.findById(logId);
      if (!log || log.userId !== userId) {
        return null;
      }
      if (!log.id) {
        throw new InternalServerError(HttpResponse.LOG_ID_NOT_FOUND);
      }

      const [tags, media] = await Promise.all([
        this.logTagRepository.findByLogId(logId),
        this.logMediaRepository.findByLogId(logId),
      ]);
      console.log(tags, media)

      // Get tag details
      const tagIds = tags.map((tag) => tag.tagId);
      const tagDetails = await Promise.all(
        tagIds.map((id) => this.tagRepository.findById(id))
      );
      const tagMap = new Map(
        tagDetails
          .filter((tag): tag is Tag => tag !== null)
          .map((tag) => [tag.id || "", tag.name])
      );

      return {
        ...log,
        tags: tags.map((tag) => ({
          id: tag.tagId,
          name: tagMap.get(tag.tagId) || "Unknown Tag",
        })),
        mediaUrls: media.map((m) => m.url),
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_FETCH_LOG;
      throw new InternalServerError(message);
    }
  }

  async updateLog(
    userId: string | undefined,
    logId: string,
    data: UpdateLogData
  ): Promise<LogWithRelations | null> {
    try {
      if (!userId) {
        throw new UnauthorizedError();
      }
      const log = await this.logRepository.findById(logId);
      if (!log || log.userId !== userId) {
        return null;
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
                createdAt: new Date(),
              } as Omit<LogTag, "id">);
              await this.tagRepository.incrementUsageCount(tagId);
            }
          }
        }
      }

      if (data.mediaUrls) {
        await this.logMediaRepository.deleteByLogId(logId);
        if (data.mediaUrls.length > 0) {
          await this.logMediaRepository.createMany(
            data.mediaUrls.map((url) => ({
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
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_FETCH_LOG;
      throw new InternalServerError(message);
    }
  }

  async deleteLog(userId: string | undefined, logId: string): Promise<boolean> {
    try {
      if (!userId) {
        throw new UnauthorizedError();
      }

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
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_DELETE_LOG;
      throw new InternalServerError(message);
    }
  }

  private async getLogWithRelations(
    logId: string
  ): Promise<LogWithRelations | null> {
    const log = await this.logRepository.findById(logId);
    if (!log) return null;

    const [tags, media] = await Promise.all([
      this.logTagRepository.findByLogId(logId),
      this.logMediaRepository.findByLogId(logId),
    ]);

    // Get tag details
    const tagIds = tags.map((tag) => tag.tagId);
    const tagDetails = await Promise.all(
      tagIds.map((id) => this.tagRepository.findById(id))
    );
    const tagMap = new Map(
      tagDetails
        .filter((tag): tag is Tag => tag !== null)
        .map((tag) => [tag.id || "", tag.name])
    );

    return {
      ...log,
      tags: tags.map((tag) => ({
        id: tag.tagId,
        name: tagMap.get(tag.tagId) || "Unknown Tag",
      })),
      mediaUrls: media.map((m) => m.url),
    };
  }
}
