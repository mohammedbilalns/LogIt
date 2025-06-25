import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { ChatService } from "../../../application/usecases/chat/chat.service";
import { ChatRepository } from "../../../infrastructure/repositories/chat.repository";
import { MessageRepository } from "../../../infrastructure/repositories/message.repository";
import { ChatParticipantRepository } from "../../../infrastructure/repositories/chat-participant.repository";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../../../utils/asyncHandler";
import { validate } from "../middlewares/validation.middleware";
import {
  createChatSchema,
  addParticipantSchema,
  sendMessageSchema,
} from "../../../application/validations/chat.validation";
import { Server } from "socket.io";

export function createChatRouter(io: Server) {
  const router = Router();

  const chatRepository = new ChatRepository();
  const messageRepository = new MessageRepository();
  const chatParticipantRepository = new ChatParticipantRepository();

  const chatService = new ChatService(
    chatRepository,
    messageRepository,
    chatParticipantRepository,
    io
  );

  const chatController = new ChatController(chatService);

  router.use(authMiddleware());

  router.post("/", validate(createChatSchema), asyncHandler((req, res) => chatController.createChat(req, res)));
  router.get("/private/:userId", asyncHandler((req, res) => chatController.getOrCreatePrivateChat(req, res)));
  router.get("/", asyncHandler((req, res) => chatController.getUserChats(req, res)));
  router.get("/:chatId", asyncHandler((req, res) => chatController.getChatDetails(req, res)));
  router.get("/:chatId/participants", asyncHandler((req, res) => chatController.getChatParticipants(req, res)));
  router.post("/:chatId/participants", validate(addParticipantSchema), asyncHandler((req, res) => chatController.addParticipant(req, res)));
  router.delete("/:chatId/participants/:userId", asyncHandler((req, res) => chatController.removeParticipant(req, res)));
  router.get("/:chatId/messages", asyncHandler((req, res) => chatController.getChatMessages(req, res)));
  router.post("/:chatId/messages", validate(sendMessageSchema), asyncHandler((req, res) => chatController.sendMessage(req, res)));

  return router;
} 