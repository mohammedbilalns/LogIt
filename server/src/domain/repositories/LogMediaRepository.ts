import { LogMedia } from "../entities/LogMedia";

export interface LogMediaRepository {
  create(logMedia: LogMedia): Promise<LogMedia>;
  findByLogId(logId: string): Promise<LogMedia[]>;
  deleteByLogId(logId: string): Promise<void>;
} 