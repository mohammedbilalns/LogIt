import { Document, Schema } from "mongoose";
import { UserStatus } from "../../domain/entities/user-status.entity";

type UserStatusWithoutId = Omit<UserStatus, "id">;
export interface UserStatusDocument extends Document, UserStatusWithoutId {}

const userStatusSchema = new Schema<UserStatusDocument>({
  userId: { type: String, required: true },
  isOnline: { type: Boolean, required: true },
  lastSeen: { type: String, required: true },
  socketId: { type: String, required: true },
});

export default userStatusSchema; 