import { Document, Schema } from "mongoose";
import { SharedLogs } from "../../domain/entities/shared-logs.entity";

type SharedLogsWithoutId = Omit<SharedLogs, "id">;
export interface SharedLogsDocument extends Document, SharedLogsWithoutId {}

const sharedLogsSchema = new Schema<SharedLogsDocument>({
  chatId: { type: String, required: true },
  messageId: { type: String, required: true },
  sharedby: { type: String, required: true },
  logId: { type: String, required: true },
  sharedAt: { type: String, required: true },
});

export default sharedLogsSchema; 