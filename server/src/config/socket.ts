import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import env from "./env";
import { logger } from "../utils/logger";
import { chatHandler } from "../interfaces/http/sockets/chat.handler";
import { notificationHandler } from "../interfaces/http/sockets/notification.handler";

export interface SocketConfig {
  io: SocketIOServer;
  pubClient: Redis;
  subClient: Redis;
}

export const onlineUsers = new Map();

export const initializeSocket = (server: HTTPServer): SocketConfig => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  const pubClient = new Redis({
    host: env.REDIS_URL,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  });
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));
  logger.green("SOCKET_IO", "Socket IO  initialized");

  io.on("connection", (socket) => {
    logger.yellow("SOCKET", `Client connected: ${socket.id}`);

    socket.on("identify", (userId: string) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.join(userId);
        socket.broadcast.emit("user_online", { userId });
        logger.green("SOCKET_ONLINE", `User online: ${userId}`);
      }
    });

    socket.on("check_online_status", ({ userIds }, callback) => {
      const status: Record<string, boolean> = {};
      userIds.forEach((id: string) => {
        status[id] = onlineUsers.has(id);
      });
      if (typeof callback === 'function') callback(status);
    });

    chatHandler(socket);
    notificationHandler();

    socket.on("disconnect", () => {
      for (const [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(userId);
          socket.broadcast.emit("user_offline", { userId });
          logger.yellow("SOCKET_OFFLINE", `User offline: ${userId}`);
          break;
        }
      }
      logger.yellow("SOCKET", `Client disconnected: ${socket.id}`);
    });
  });

  return {
    io,
    pubClient,
    subClient,
  };
};
 