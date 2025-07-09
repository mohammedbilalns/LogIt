import { Server } from "socket.io";
import { onlineUsers } from "../../../config/socket";
import { Notification } from "../../../domain/entities/notification.entity";
import { logger } from '../../../utils/logger';

export function notificationHandler() {
}

export function emitNotificationToUser(io: Server, userId: string, notification: Notification) {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    logger.yellow("SOCKET", `Sending notification to user ${userId} at socket ${socketId}`);
    io.to(socketId).emit("notification", notification);
  } else {
    logger.red("SOCKET", `User ${userId} is not online, cannot send live notification`);
  }
} 