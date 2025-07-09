import mongoose, { Document, Schema } from "mongoose";
import { Notification } from "../../domain/entities/notification.entity";

type NotificationWithoutId = Omit<Notification, "id">;
export interface NotificationDocument extends Document, NotificationWithoutId {}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: String, required: true },
    type: {
      type: String,
      enum: ["chat", "subscription", "group"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, required: true, default: false },
    readAt: { type: String },
  },
  {
    timestamps: true, 
  }
);

const NotificationModel = mongoose.model<NotificationDocument>(
  "Notification",
  NotificationSchema
);
export default NotificationModel;
