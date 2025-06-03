import { Schema, model } from 'mongoose';
import { LogMedia } from '../../domain/entities/LogMedia';

const LogMediaSchema = new Schema<LogMedia>({
  logId: { type: String, required: true },
  url: { type: String, required: true },
});

export const LogMediaModel = model<LogMedia>('LogMedia', LogMediaSchema); 