import mongoose, { Document } from "mongoose";
import { User } from "../../domain/entities/user.entity";

type UserWithoutId = Omit<User, "id">;

export interface UserDocument extends Document, UserWithoutId {}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    googleId: { type: String },
    profileImage: { type: String },
    profession: { type: String },
    bio: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
