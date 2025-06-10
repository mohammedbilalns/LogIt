import { ReportRepository } from '../../domain/repositories/report.repository.interface';
import { Report } from '../../domain/entities/report.entity';
import ReportModel, {  ReportDocument } from '../mongodb/report.schema';
import { BaseRepository } from './base.repository';

export class MongoReportRepository extends BaseRepository<ReportDocument, Report> implements ReportRepository {
  constructor() {
    super(ReportModel);
  }

  protected getSearchFields(): string[] {
    return ['reason', 'targetType', 'targetId'];
  }

  protected mapToEntity(doc: ReportDocument): Report {
    const report = doc.toObject();
    return {
      ...report,
      id: report._id.toString(),
    };
  }

  async findByTarget(targetType: 'article' | 'user', targetId: string): Promise<Report[]> {
    const reports = await ReportModel.find({ targetType, targetId });
    return reports.map(report => this.mapToEntity(report));
  }

  async updateStatus(id: string, status: 'pending' | 'reviewed' | 'resolved', actionTaken?: string | null): Promise<Report | null> {
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      { $set: { status, actionTaken } },
      { new: true }
    );
    return updatedReport ? this.mapToEntity(updatedReport) : null;
  }

 
  async exists(id: string): Promise<boolean> {
    const count = await ReportModel.countDocuments({ _id: id });
    return count > 0;
  }

  async existsByTarget(params: { targetType: 'article' | 'user'; targetId: string; reporterId: string }): Promise<boolean> {
    const count = await ReportModel.countDocuments({
      targetType: params.targetType,
      targetId: params.targetId,
      reportedBy: params.reporterId
    });
    return count > 0;
  }
} 