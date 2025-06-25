import { Document, Schema, model } from "mongoose";
import { Message } from "../../domain/entities/message.entity";

type MessageWithoutId = Omit<Message, "id">;
export interface MessageDocument extends Document, MessageWithoutId {}

const messageSchema = new Schema<MessageDocument>({
  chatId: { type: String, required: true },
  senderId: { type: String, required: true },
  content: { type: String },
  media: { type: String },
  log: { type: String },
  replyTo: { type: String },
  deletedFor: [{ type: String, default: [] }],
  seenBy: [{ type: String, default: [] }],

}, {timestamps:true});

const MessageModel = model<MessageDocument>("Message", messageSchema);

export default MessageModel; 