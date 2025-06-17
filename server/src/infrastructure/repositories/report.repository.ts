import { IReportRepository } from '../../domain/repositories/report.repository.interface';
import { Report } from '../../domain/entities/report.entity';
import ReportModel, { ReportDocument } from '../mongodb/report.schema';
import { BaseRepository } from './base.repository';
import { FilterQuery } from 'mongoose';
import { logger } from '../../utils/logger';

export class MongoReportRepository extends BaseRepository<ReportDocument, Report> implements IReportRepository {
  constructor() {
    super(ReportModel);
  }

  protected getSearchFields(): string[] {
    return ['reason', 'targetType', 'targetId'];
  }

  protected mapToEntity(doc: ReportDocument): Report {
    try {
      const report = doc.toObject();
      console.log("Report doc: " ,doc)
      if (!report.reportedBy) {
        logger.yellow('REPORT_MAPPING_WARNING', `Report ${report._id} has no reporter information`);
        throw new Error('Report has no reporter information');
      }

      
      return {
        id: report._id.toString(),
        reportedBy: {
          id: report.reportedBy._id.toString(),
          name: report.reportedBy.name || 'Unknown User',
          email: report.reportedBy.email || 'unknown@email.com'
        },
        targetType: report.targetType,
        targetId: report.targetId,
        reason: report.reason,
        status: report.status,
        actionTaken: report.actionTaken,
        createdAt: report.createdAt
      };
    } catch (error) {
      logger.red('REPORT_MAPPING_ERROR', error instanceof Error ? error.message : 'Failed to map report document to entity');
      throw error;
    }
  }

  async create(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
    try {
      const doc = await ReportModel.create({
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason,
        status: data.status,
        actionTaken: data.actionTaken,
        reportedBy: data.reportedBy.id 
      });

      // Fetch the created document with populated reporter
      const populatedDoc = await ReportModel.findById(doc._id).populate('reportedBy', 'name email');
      if (!populatedDoc) {
        throw new Error('Failed to create report');
      }

      return this.mapToEntity(populatedDoc);
    } catch (error) {
      logger.red('CREATE_REPORT_ERROR', error instanceof Error ? error.message : 'Failed to create report');
      throw error;
    }
  }

  async findByTarget(targetType: 'article' | 'user', targetId: string): Promise<Report[]> {
    try {
      const reports = await ReportModel.find({ targetType, targetId })
        .populate('reportedBy', 'name email');
      return reports.map(report => this.mapToEntity(report));
    } catch (error) {
      logger.red('FIND_BY_TARGET_ERROR', error instanceof Error ? error.message : 'Failed to find reports by target');
      throw error;
    }
  }

  async updateStatus(id: string, status: 'pending' | 'reviewed' | 'resolved', actionTaken?: string | null): Promise<Report | null> {
    try {
      const updatedReport = await ReportModel.findByIdAndUpdate(
        id,
        { $set: { status, actionTaken } },
        { new: true }
      ).populate('reportedBy', 'name email');
      return updatedReport ? this.mapToEntity(updatedReport) : null;
    } catch (error) {
      logger.red('UPDATE_STATUS_ERROR', error instanceof Error ? error.message : 'Failed to update report status');
      throw error;
    }
  }


  async existsByTarget(params: { targetType: 'article' | 'user'; targetId: string; reporterId: string }): Promise<boolean> {
    try {
      const count = await ReportModel.countDocuments({
        targetType: params.targetType,
        targetId: params.targetId,
        reportedBy: params.reporterId
      });
      return count > 0;
    } catch (error) {
      logger.red('EXISTS_BY_TARGET_ERROR', error instanceof Error ? error.message : 'Failed to check report existence by target');
      throw error;
    }
  }

  async findWithPagination({ skip, limit, search, status }: { skip: number; limit: number; search?: string; status?: 'pending' | 'reviewed' | 'resolved' }): Promise<{ reports: Report[]; total: number }> {
    try {
      const query: FilterQuery<ReportDocument> = {};

      if (status) {
        query.status = status;
      }

      if (search) {
        const searchFields = this.getSearchFields();
        query.$or = searchFields.map(field => ({
          [field]: { $regex: search, $options: 'i' }
        }));
      }

      const total = await ReportModel.countDocuments(query);

      const reports = await ReportModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'name email');

      // Filter out any reports that fail to map due to missing reporter information
      const validReports = reports
        .map(report => {
          try {
            return this.mapToEntity(report);
          } catch (error) {
            logger.yellow('REPORT_MAPPING_SKIP', `Skipping report ${report._id} due to mapping error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
          }
        })
        .filter((report): report is Report => report !== null);

      return {
        reports: validReports,
        total
      };
    } catch (error) {
      logger.red('FIND_WITH_PAGINATION_ERROR', error instanceof Error ? error.message : 'Failed to find reports with pagination');
      throw error;
    }
  }
} 