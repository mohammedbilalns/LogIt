import { LogMedia } from "../entities/log-media.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface ILogMediaRepository extends IBaseRepository<LogMedia> {
  createMany(data: Omit<LogMedia, "id">[]): Promise<LogMedia[]>;
  findByLogId(logId: string): Promise<LogMedia[]>;
  findByLogIds(logIds: string[]): Promise<LogMedia[]>;
  deleteByLogId(logId: string): Promise<void>;
}
