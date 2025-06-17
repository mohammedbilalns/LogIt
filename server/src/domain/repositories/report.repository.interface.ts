import { Report } from '../entities/report.entity';
import { IBaseRepository } from './base.repository.interface';

interface PaginationParams {
  skip: number;
  limit: number;
  search?: string;
  status?: 'pending' | 'reviewed' | 'resolved' | 'blocked';
}

interface PaginationResult<T> {
  reports: T[];
  total: number;
}

export interface IReportRepository extends IBaseRepository<Report> {
  findByTarget(targetType: 'article' | 'user', targetId: string): Promise<Report[]>;
  updateStatus(id: string, status: 'pending' | 'reviewed' | 'resolved' | 'blocked', actionTaken?: string | null): Promise<Report | null>;
  existsByTarget(params: { targetType: 'article' | 'user'; targetId: string; reporterId: string }): Promise<boolean>;
  findWithPagination(params: PaginationParams): Promise<PaginationResult<Report>>;
} 