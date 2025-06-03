import { Schema, model } from 'mongoose';
import { LogTag } from '../../domain/entities/LogTag';

const LogTagSchema = new Schema<LogTag>({
  logId: { type: String, required: true },
  tagId: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, required: true }
});

export const LogTagModel = model<LogTag>('LogTag', LogTagSchema); 