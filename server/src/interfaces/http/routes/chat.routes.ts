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
  createGroupChatSchema,
  addParticipantSchema,
  sendMessageSchema,
} from "../../../application/validations/chat.validation";
import { Server } from "socket.io";
import { csrfMiddleware } from "../middlewares/csrf.middleware";

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

  router.use(
    asyncHandler((req, res, next) => authMiddleware()(req, res, next)),
    asyncHandler((req, res, next) => csrfMiddleware()(req, res, next))
  );

  router.post(
    "/",
    validate(createChatSchema),
    asyncHandler((req, res) => chatController.createChat(req, res))
  );
  router.post(
    "/group",
    validate(createGroupChatSchema),
    asyncHandler((req, res) => chatController.createGroupChat(req, res))
  );
  router.get(
    "/group",
    asyncHandler((req, res) => chatController.getUserGroupChats(req, res))
  );
  router.get(
    "/private/:userId",
    asyncHandler((req, res) => chatController.getOrCreatePrivateChat(req, res))
  );
  router.get(
    "/",
    asyncHandler((req, res) => chatController.getUserChats(req, res))
  );
  router.get(
    "/:chatId",
    asyncHandler((req, res) => chatController.getChatDetails(req, res))
  );
  router.get(
    "/:chatId/participants",
    asyncHandler((req, res) => chatController.getChatParticipants(req, res))
  );
  router.delete(
    "/:chatId/participants/:userId",
    asyncHandler((req, res) => chatController.removeParticipant(req, res))
  );
  router.post(
    "/:chatId/messages",
    validate(sendMessageSchema),
    asyncHandler((req, res) => chatController.sendMessage(req, res))
  );
  router.patch(
    "/:chatId/name",
    asyncHandler((req, res) => chatController.updateGroupName(req, res))
  );
  router.patch(
    "/:chatId/participants/:userId/promote",
    asyncHandler((req, res) => chatController.promoteParticipant(req, res))
  );
  router.post(
    "/:chatId/leave",
    asyncHandler((req, res) => chatController.leaveGroup(req, res))
  );

  router.post(
    "/:chatId/participants",
    validate(addParticipantSchema),
    asyncHandler((req, res) => chatController.addParticipant(req, res))
  );

  return router;
}
