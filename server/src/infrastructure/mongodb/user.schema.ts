import mongoose, {Schema} from "mongoose";
import {User } from "../../domain/entities/user.entity";

const userSchema = new Schema<User>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: false},
    isVerified: {type: Boolean, default: false},
    isBlocked: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    googleId: {type: String},
    profileImage: {type: String},
    provider: {type: String, enum: ["local", "google"], default: "local"},
    role: {type: String, enum: ["user", "admin", "superadmin"], default: "user"}
});

export default mongoose.model<User>("User", userSchema)