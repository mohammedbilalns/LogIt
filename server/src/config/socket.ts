import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import env from "./env";
import { logger } from "../utils/logger";

export interface SocketConfig {
  io: SocketIOServer;
  pubClient: Redis;
  subClient: Redis;
}

export const initializeSocket = (server: HTTPServer): SocketConfig => {
  // Initialize Socket.IO server
  const io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Initialize Redis clients
  const pubClient = new Redis({
    host: env.REDIS_URL,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  });
  const subClient = pubClient.duplicate();

  // Set up Redis adapter
  io.adapter(createAdapter(pubClient, subClient));
  logger.green("SOCKET_IO", "Redis adapter initialized");

  // Set up Socket.IO event handlers
  io.on("connection", (socket) => {
    logger.yellow("SOCKET", `Client connected: ${socket.id}`);

    socket.on("chat:message", (data) => {
      io.to(data.roomId).emit("chat:message", data);
    });

    socket.on("disconnect", () => {
      logger.yellow("SOCKET", `Client disconnected: ${socket.id}`);
    });
  });

  return {
    io,
    pubClient,
    subClient,
  };
}; 