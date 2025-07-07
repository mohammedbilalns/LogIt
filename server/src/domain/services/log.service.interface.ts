import {
  CreateLogData,
  UpdateLogData,
  GetLogsOptions,
  LogWithRelations,
} from "../../application/dtos";

export interface ResourceLimitResponse {
  limitExceeded: true;
  currentPlan: {
    id: string;
    name: string;
    price: number;
    maxLogsPerMonth: number;
    maxArticlesPerMonth: number;
    description: string;
  };
  nextPlan?: {
    id: string;
    name: string;
    price: number;
    maxLogsPerMonth: number;
    maxArticlesPerMonth: number;
    description: string;
  };
  currentUsage: number;
  limit: number;
  exceededResource: 'logs';
}

export interface ILogService {
  createLog(
    userId: string | undefined,
    data: CreateLogData
  ): Promise<LogWithRelations | ResourceLimitResponse>;
  getLogs(
    userId: string,
    options: GetLogsOptions
  ): Promise<{ logs: LogWithRelations[]; total: number }>;
  getLog(
    userId: string | undefined,
    logId: string
  ): Promise<LogWithRelations | null>;
  updateLog(
    userId: string | undefined,
    logId: string,
    data: UpdateLogData
  ): Promise<LogWithRelations | null>;
  deleteLog(userId: string | undefined, logId: string): Promise<boolean>;
}
