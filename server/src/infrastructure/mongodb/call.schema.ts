import mongoose, { Document } from 'mongoose';
import { Call } from '../../domain/entities/call.entity';

type CallWithoutId = Omit<Call, 'id'>;

export interface CallDocument extends Document, CallWithoutId {}

const callSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['audio', 'video'],
      required: true,
    },
    chatId: {
      type: String,
      required: true,
      index: true,
    },
    participants: [{
      type: String,
      required: true,
    }],
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    endedBy: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'ended', 'missed'],
      default: 'active',
    },
    duration: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

callSchema.index({ chatId: 1, createdAt: -1 });
callSchema.index({ participants: 1, createdAt: -1 });
callSchema.index({ status: 1, createdAt: -1 });

const CallModel = mongoose.model<CallDocument>('Call', callSchema);

export default CallModel; 