import mongoose, { Document, Schema } from 'mongoose';
import { Report } from '../../domain/entities/report.entity';

// type that omits the id from Report
type ReportWithoutId = Omit<Report, 'id'>;

// Extend Document and add Report properties without id
export interface ReportDocument extends Document, ReportWithoutId {}

const reportSchema = new Schema<ReportDocument>({
  reportedBy: { type: String, required: true },
  targetType: { type: String, required: true, enum: ['article', 'user'] }, // Type of content being reported
  targetId: { type: String, required: true }, // ID of the reported article or user
  reason: { type: String, required: true },
  status: { type: String, required: true, default: 'pending', enum: ['pending', 'reviewed', 'resolved'] },
  actionTaken: { type: String, default: null }, // e.g., 'article hidden', 'user warning', 'no action'
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

 const ReportModel = mongoose.model<ReportDocument>('Report', reportSchema); 

 export default ReportModel