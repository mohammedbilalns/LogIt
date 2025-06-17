import mongoose, { Schema, Document } from "mongoose";
import { OTP } from "../../domain/entities/otp.entity";

type OTPWithoutId = Omit<OTP, "id">;

export interface OTPDocument extends Document, OTPWithoutId {}

const otpSchema = new Schema<OTPDocument>(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    retryAttempts: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["verification", "reset"],
      default: "verification",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTPModel = mongoose.model<OTPDocument>("OTP", otpSchema);
export default OTPModel;
