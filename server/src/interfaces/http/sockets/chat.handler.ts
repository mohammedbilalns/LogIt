import { Server, Socket } from "socket.io";
import { logger } from "../../../utils/logger";

export const chatHandler = (_: Server, socket: Socket) => {
  logger.green("SOCKET_CHAT", `Chat handler registered for socket: ${socket.id}`);



  // When a user logs in, they should join a room with their user ID
  // This allows us to send direct notifications (e.g., new chat created)
  socket.on("join_user_room", (userId: string) => {
      socket.join(userId);
      logger.blue("SOCKET_ROOM", `Socket ${socket.id} joined user room: ${userId}`);
  });

  // When a user opens a chat, they should join a room for that chat
  socket.on("join_chat_room", (chatId: string) => {
    socket.join(chatId);
    logger.blue("SOCKET_ROOM", `Socket ${socket.id} joined chat room: ${chatId}`);
  });

  socket.on("leave_chat_room", (chatId: string) => {
    socket.leave(chatId);
    logger.blue("SOCKET_ROOM", `Socket ${socket.id} left chat room: ${chatId}`);
  });

}; 