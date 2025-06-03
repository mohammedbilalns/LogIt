import { LogTag } from "../entities/LogTag";

export interface LogTagRepository {
  create(logTag: LogTag): Promise<LogTag>;
  findByLogId(logId: string): Promise<LogTag[]>;
  deleteByLogId(logId: string): Promise<void>;
} 