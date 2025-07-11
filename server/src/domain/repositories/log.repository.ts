import { Log } from "../entities/log.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface ILogRepository extends IBaseRepository<Log> {
  findMany(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      tags?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<Log[]>;

  countLogs(
    userId: string,
    options: {
      search?: string;
      tags?: string[];
      createdAt?: { $gte?: Date; $lte?: Date };
    }
  ): Promise<number>;
}
