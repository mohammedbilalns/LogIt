import { Document, Schema } from "mongoose";
import { MessageMedia } from "../../domain/entities/message-media.entity";

type MessageMediaWithoutId = Omit<MessageMedia, "id">;
export interface MessageMediaDocument extends Document, MessageMediaWithoutId {}

const messageMediaSchema = new Schema<MessageMediaDocument>({
  messageId: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "audio"], required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: String, required: true },
});

export default messageMediaSchema; 