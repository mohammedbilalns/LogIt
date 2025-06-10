import { Report } from '../entities/report.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ReportRepository extends IBaseRepository<Report> {
  findByTarget(targetType: 'article' | 'user', targetId: string): Promise<Report[]>;
  updateStatus(id: string, status: 'pending' | 'reviewed' | 'resolved', actionTaken?: string | null): Promise<Report | null>;
  existsByTarget(params: { targetType: 'article' | 'user'; targetId: string; reporterId: string }): Promise<boolean>;
} 