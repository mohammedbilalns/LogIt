import { Chat } from "../../domain/entities/chat.entity";
import mongoose, { Document, Schema } from "mongoose";

type ChatWithoutId = Omit<Chat, "id">;
export interface ChatDocument extends Document, ChatWithoutId {}
const chatSchema = new Schema<ChatDocument>(
  {
    isGroup: { type: Boolean, required: true },
    name: { type: String },
    creator: { type: String },
    lastMessage: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const ChatModel = mongoose.model<ChatDocument>("Chat", chatSchema);

export default ChatModel;
