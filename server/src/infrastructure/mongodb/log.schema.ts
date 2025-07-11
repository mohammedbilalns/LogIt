import mongoose, { Document, Schema } from "mongoose";
import { Log } from "../../domain/entities/log.entity";

type LogWithoutId = Omit<Log, "id">;

export interface LogDocument extends Document, LogWithoutId {}

const LogSchema = new Schema<LogDocument>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

LogSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const LogModel = mongoose.model<LogDocument>("Log", LogSchema);

export default LogModel;
