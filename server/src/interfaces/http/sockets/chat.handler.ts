import { Server, Socket } from "socket.io";
import { logger } from "../../../utils/logger";
import { onlineUsers } from "../../../config/socket";

export const chatHandler = (_: Server, socket: Socket) => {
  logger.green(
    "SOCKET_CHAT",
    `Chat handler registered for socket: ${socket.id}`
  );

  socket.on("join_user_room", (userId: string) => {
    socket.join(userId);
    logger.blue(
      "SOCKET_ROOM",
      `Socket ${socket.id} joined user room: ${userId}`
    );
  });

  socket.on("join_chat_room", (chatId: string) => {
    socket.join(chatId);
    logger.blue(
      "SOCKET_ROOM",
      `Socket ${socket.id} joined chat room: ${chatId}`
    );
  });

  socket.on("leave_chat_room", (chatId: string) => {
    socket.leave(chatId);
    logger.blue("SOCKET_ROOM", `Socket ${socket.id} left chat room: ${chatId}`);
  });

  socket.on("force_leave_chat_room", (chatId: string) => {
    socket.leave(chatId);
    logger.blue("SOCKET_ROOM", `Socket ${socket.id} forcefully left chat room: ${chatId}`);
  });

  socket.on(
    "get_group_online_count",
    (userIds: string[], callback: (count: number) => void) => {
      if (!Array.isArray(userIds)) return callback(0);
      let count = 0;
      for (const uid of userIds) {
        if (onlineUsers.has(uid)) count++;
      }
      callback(count);
    }
  );
};
