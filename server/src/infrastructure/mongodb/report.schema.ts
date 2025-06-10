import mongoose, { Document, Schema, Types } from 'mongoose';
import { Report } from '../../domain/entities/report.entity';

// type that omits the id from Report
type ReportWithoutId = Omit<Report, 'id'>;

// Extend Document and add Report properties without id
export interface ReportDocument extends Document, ReportWithoutId {}

const reportSchema = new Schema<ReportDocument>({
  reportedBy: { 
    type: Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  targetType: { type: String, required: true, enum: ['article', 'user'] },
  targetId: { type: String, required: true }, 
  reason: { type: String, required: true },
  status: { type: String, required: true, default: 'pending', enum: ['pending', 'reviewed', 'resolved'] },
  actionTaken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const ReportModel = mongoose.model<ReportDocument>('Report', reportSchema);

export default ReportModel;