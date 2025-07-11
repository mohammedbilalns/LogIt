import mongoose, { Document, Schema } from "mongoose";
import { LogMedia } from "../../domain/entities/log-media.entity";

type LogMediaWithoutId = Omit<LogMedia, "id">;

export interface LogMediaDocument extends Document, LogMediaWithoutId {}

const LogMediaSchema = new Schema<LogMediaDocument>(
  {
    logId: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

const LogMediaModel = mongoose.model<LogMediaDocument>(
  "LogMedia",
  LogMediaSchema
);
export default LogMediaModel;
