import { Schema, model } from 'mongoose';
import { LogTag } from '../../domain/entities/LogTag';

const LogTagSchema = new Schema<LogTag>({
  logId: { type: String, required: true },
  tag: { type: String, required: true },
});

export const LogTagModel = model<LogTag>('LogTag', LogTagSchema); 