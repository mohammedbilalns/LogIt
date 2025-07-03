import { Document, model, Schema } from "mongoose";
import { MessageMedia } from "../../domain/entities/message-media.entity";

type MessageMediaWithoutId = Omit<MessageMedia, "id">;
export interface MessageMediaDocument extends Document, MessageMediaWithoutId {}

const messageMediaSchema = new Schema<MessageMediaDocument>({
  messageId: { type: String, required: true },
  url: { type: String, required: true },
  mediaType: { type: String, enum: ["image", "audio"], required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, required: true },
});


const MessageMediaModel = model<MessageMediaDocument>('MessageMedia', messageMediaSchema);
export default MessageMediaModel; 