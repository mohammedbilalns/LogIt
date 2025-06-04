import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, required: true, enum: ['article', 'user'] }, // Type of content being reported
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the reported article or user
  reason: { type: String, required: true },
  status: { type: String, required: true, default: 'pending', enum: ['pending', 'reviewed', 'resolved'] },
  actionTaken: { type: String, default: null }, // e.g., 'article hidden', 'user warning', 'no action'
  createdAt: { type: Date, default: Date.now },
});

export const ReportModel = mongoose.model('Report', reportSchema); 