import { IReportRepository } from "../../domain/repositories/report.repository.interface";
import { Report } from "../../domain/entities/report.entity";
import ReportModel, { ReportDocument } from "../mongodb/report.schema";
import { BaseRepository } from "./base.repository";
import { FilterQuery } from "mongoose";
import { InternalServerError } from "../../application/errors/internal.errors";
import { HttpResponse } from "../../constants/responseMessages";

export class MongoReportRepository
  extends BaseRepository<ReportDocument, Report>
  implements IReportRepository
{
  constructor() {
    super(ReportModel);
  }

  protected getSearchFields(): string[] {
    return ["reason", "targetType", "targetId"];
  }

  protected mapToEntity(doc: ReportDocument): Report {
    const report = doc.toObject();

    let reportedByInfo = {
      id: "",
      name: "",
      email: "",
    };

    if (report.reportedBy) {
      if (typeof report.reportedBy === "object" && report.reportedBy._id) {
        reportedByInfo = {
          id: report.reportedBy._id.toString(),
          name: report.reportedBy.name,
          email: report.reportedBy.email,
        };
      } else if (typeof report.reportedBy === "string") {
        reportedByInfo.id = report.reportedBy;
      } else if (
        report.reportedBy &&
        typeof report.reportedBy === "object" &&
        report.reportedBy.toString
      ) {
        reportedByInfo.id = report.reportedBy.toString();
      }
    }

    return {
      id: report._id.toString(),
      reportedBy: reportedByInfo,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      status: report.status,
      actionTaken: report.actionTaken,
      createdAt: report.createdAt,
    };
  }

  async create(
    data: Omit<Report, "id" | "createdAt" | "updatedAt">
  ): Promise<Report> {
    const doc = await ReportModel.create({
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      status: data.status,
      actionTaken: data.actionTaken,
      reportedBy: data.reportedBy.id,
    });

    const populatedDoc = await ReportModel.findById(doc._id).populate(
      "reportedBy",
      "name email"
    );
    if (!populatedDoc) {
      throw new InternalServerError(HttpResponse.FAILED_TO_CREATE_LOG);
    }

    return this.mapToEntity(populatedDoc);
  }

  async findByTarget(
    targetType: "article" | "user",
    targetId: string
  ): Promise<Report[]> {
    const reports = await ReportModel.find({ targetType, targetId }).populate(
      "reportedBy",
      "name email"
    );
    return reports.map((report) => this.mapToEntity(report));
  }

  async updateStatus(
    id: string,
    status: "pending" | "reviewed" | "resolved",
    actionTaken?: string | null
  ): Promise<Report | null> {
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      { $set: { status, actionTaken } },
      { new: true }
    ).populate("reportedBy", "name email");
    return updatedReport ? this.mapToEntity(updatedReport) : null;
  }

  async existsByTarget(params: {
    targetType: "article" | "user";
    targetId: string;
    reporterId: string;
  }): Promise<boolean> {
    const count = await ReportModel.countDocuments({
      targetType: params.targetType,
      targetId: params.targetId,
      reportedBy: params.reporterId,
    });
    return count > 0;
  }

  async findReports({
    page,
    limit,
    search,
    status,
  }: {
    page: number;
    limit: number;
    search?: string;
    status?: "pending" | "reviewed" | "resolved" | "blocked";
  }): Promise<{ reports: Report[]; total: number }> {
    const query: FilterQuery<ReportDocument> = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchFields = this.getSearchFields();
      query.$or = searchFields.map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }

    const skip = (page - 1) * limit;
    const total = await ReportModel.countDocuments(query);

    const reports = await ReportModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reportedBy", "name email");

    const validReports = reports
      .map((report) => {
        return this.mapToEntity(report);
      })
      .filter((report): report is Report => report !== null);

    return {
      reports: validReports,
      total,
    };
  }
}
