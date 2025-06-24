import { Document, Schema, model } from "mongoose";
import { ChatParticipants } from "../../domain/entities/chat-participants";

type ChatParticipantsWithoutId = Omit<ChatParticipants, "id">;
export interface ChatParticipantsDocument extends Document, ChatParticipantsWithoutId {}

const chatParticipantsSchema = new Schema<ChatParticipantsDocument>({
  chatId: { type: String, required: true },
  userId: { type: String, required: true },
  role: { type: String, enum: ["admin", "member"], required: true },
  joinedAt: { type: Date, required: true },
  isMuted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  leftAt: { type: String },
});

const ChatParticipantsModel = model<ChatParticipantsDocument>("ChatParticipants", chatParticipantsSchema);

export default ChatParticipantsModel;