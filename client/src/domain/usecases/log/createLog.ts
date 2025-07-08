import { logService } from '@/application/services/logService';
import { Log } from '@/domain/entities/log';

export interface LogLimitExceededResponse {
  limitExceeded: true;
  currentPlan: {
    id: string;
    name: string;
    price: number;
    maxLogsPerMonth: number;
    maxArticlesPerMonth: number;
    description: string;
  };
  nextPlans: Array<{
    id: string;
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    maxLogsPerMonth: number;
    maxArticlesPerMonth: number;
  }>;
  currentUsage: number;
  limit: number;
  exceededResource: 'logs' | 'articles';
}

export type CreateLogResult = Log | LogLimitExceededResponse;

export async function createLog(title: string, content: string, tags: string[]): Promise<CreateLogResult> {
  return await logService.createLog(title, content, tags);
} 