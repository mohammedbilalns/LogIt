import { Report } from '../entities/report.entity';

export interface ReportRepository {
  create(data: Omit<Report, 'id' | 'status' | 'actionTaken' | 'createdAt'>): Promise<Report>;
  findById(id: string): Promise<Report | null>;
  findByTarget(targetType: 'article' | 'user', targetId: string): Promise<Report[]>;
  updateStatus(id: string, status: 'pending' | 'reviewed' | 'resolved', actionTaken?: string | null): Promise<Report | null>;
  exists(params: { targetType: 'article' | 'user'; targetId: string; reporterId: string }): Promise<boolean>;
} 