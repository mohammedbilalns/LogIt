import { Schema, model } from 'mongoose';
import { Log } from '../../domain/entities/Log';

const LogSchema = new Schema<Log>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

LogSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const LogModel = model<Log>('Log', LogSchema); 