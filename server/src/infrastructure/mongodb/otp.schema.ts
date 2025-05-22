import mongoose, {Schema} from "mongoose";
import { OTP } from "src/domain/entities/otp.entity";

const otpSchema = new Schema<OTP>({
    email: {type: String, required: true, unique: true},
    otp: {type: String, required: true},
    createdAt: {type: Date, required: true},
    expiresAt: {type: Date, required: true},
    retryAttempts: {type: Number, default: 0},
    type: {type: String, enum: ["verification", "reset"], default: "verification"}
});

//  TTL index on expiresAt field
otpSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

export default mongoose.model<OTP>("OTP", otpSchema);