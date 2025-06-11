import mongoose, { Document } from 'mongoose';
import { LogTag } from '../../domain/entities/log-tag.entity';

// type that omits the id from LogTag 
type LogTagWithoutId = Omit<LogTag, 'id'>;

// Extend Document and add LogTag properties without id
export interface LogTagDocument extends Document, LogTagWithoutId {}

const LogTagSchema = new mongoose.Schema<LogTagDocument>({
  logId: { type: String, required: true },
  tagId: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, required: true }
}, { timestamps: true });

 const LogTagModel = mongoose.model<LogTagDocument>('LogTag', LogTagSchema); 

 export default LogTagModel 