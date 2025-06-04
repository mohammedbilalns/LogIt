import { ReportRepository } from '../../domain/repositories/report.repository.interface';
import { Report } from '../../domain/entities/report.entity';
import { ReportModel } from '../mongodb/report.schema';
import mongoose from 'mongoose'; // Import mongoose

export class MongoReportRepository implements ReportRepository {
  async create(data: Omit<Report, 'id' | 'status' | 'actionTaken' | 'createdAt'>): Promise<Report> {
    const createdReport = await ReportModel.create(data);
    // Map Mongoose document to domain entity, converting _id to id and ObjectId to string
    const reportObject = createdReport.toObject();
    return {
      id: reportObject._id.toString(),
      reportedBy: reportObject.reportedBy.toString(),
      targetType: reportObject.targetType,
      targetId: reportObject.targetId.toString(),
      reason: reportObject.reason,
      status: reportObject.status,
      actionTaken: reportObject.actionTaken,
      createdAt: reportObject.createdAt,
    };
  }

  async findById(id: string): Promise<Report | null> {
    const report = await ReportModel.findById(id).lean();
    if (!report) return null;
    // Map Mongoose document to domain entity
     return {
      id: report._id.toString(),
      reportedBy: report.reportedBy.toString(),
      targetType: report.targetType,
      targetId: report.targetId.toString(),
      reason: report.reason,
      status: report.status,
      actionTaken: report.actionTaken,
      createdAt: report.createdAt,
    };
  }

  async findByTarget(targetType: 'article' | 'user', targetId: string): Promise<Report[]> {
    const reports = await ReportModel.find({ targetType, targetId: new mongoose.Types.ObjectId(targetId) }).lean();
    // Map Mongoose documents to domain entities
    return reports.map(report => ({
      id: report._id.toString(),
      reportedBy: report.reportedBy.toString(),
      targetType: report.targetType,
      targetId: report.targetId.toString(),
      reason: report.reason,
      status: report.status,
      actionTaken: report.actionTaken,
      createdAt: report.createdAt,
    }));
  }

  async updateStatus(id: string, status: 'pending' | 'reviewed' | 'resolved', actionTaken?: string | null): Promise<Report | null> {
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      { $set: { status, actionTaken } },
      { new: true }
    ).lean();
    
    if (!updatedReport) return null;

    // Map Mongoose document to domain entity
    return {
      id: updatedReport._id.toString(),
      reportedBy: updatedReport.reportedBy.toString(),
      targetType: updatedReport.targetType,
      targetId: updatedReport.targetId.toString(),
      reason: updatedReport.reason,
      status: updatedReport.status,
      actionTaken: updatedReport.actionTaken,
      createdAt: updatedReport.createdAt,
    };
  }

  async exists(params: { targetType: 'article' | 'user'; targetId: string; reporterId: string }): Promise<boolean> {
    try {
      // Explicitly create ObjectIds for comparison
      const targetObjectId = new mongoose.Types.ObjectId(params.targetId);
      const reporterObjectId = new mongoose.Types.ObjectId(params.reporterId);

      const count = await ReportModel.countDocuments({
        targetType: params.targetType,
        targetId: targetObjectId,
        reportedBy: reporterObjectId
      });
      return count > 0;
    } catch (error) {
      // If IDs are not valid ObjectId strings, the ObjectId constructor will throw
      console.error("Error creating ObjectId in ReportRepository.exists:", error);
      return false; // Assume not reported if IDs are invalid
    }
  }
} 