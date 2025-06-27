import { Schema, model, Document } from 'mongoose';

export interface ChatActionLogDocument extends Document {
  chatId: string;
  actionBy: string;
  action: 'added' | 'removed' | 'muted' | 'unmuted' | 'renamed' | 'left' | 'promoted';
  targetUser?: string;
  message?: string;
  createdAt: Date;
}

const ChatActionLogSchema = new Schema<ChatActionLogDocument>(
  {
    chatId: { type: String, required: true },
    actionBy: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: ['added', 'removed', 'muted', 'unmuted', 'renamed', 'left', 'promoted'],
    },
    targetUser: { type: String },
    message: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<ChatActionLogDocument>('ChatActionLog', ChatActionLogSchema); 