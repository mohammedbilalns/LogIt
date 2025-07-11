import mongoose, { Document, Schema } from 'mongoose';
import { CallEvent } from '../../domain/entities/call-event.entity';

type CallEventWithoutId = Omit<CallEvent, 'id'>;

export interface CallEventDocument extends Document, CallEventWithoutId {}

const callEventSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['start', 'end', 'join', 'leave', 'mute', 'unmute', 'video_on', 'video_off'],
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

callEventSchema.index({ callId: 1, timestamp: -1 });
callEventSchema.index({ userId: 1, timestamp: -1 });
callEventSchema.index({ type: 1, timestamp: -1 });

const CallEventModel = mongoose.model<CallEventDocument>('CallEvent', callEventSchema);

export default CallEventModel; 