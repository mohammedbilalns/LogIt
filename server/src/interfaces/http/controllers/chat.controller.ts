import { Request, Response } from "express";
import { IChatService } from "../../../domain/services/chat.service.interface";

export class ChatController {
  constructor(private chatService: IChatService) {}

  async createChat(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const chat = await this.chatService.createChat(userId, req.body);
    res.status(201).json(chat);
  }

  
  async getUserChats(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const chats = await this.chatService.getUserChats(userId);
    res.status(200).json(chats);
  }

  async getChatDetails(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const chatDetails = await this.chatService.getChatDetails(req.params.chatId, userId);
    res.status(200).json(chatDetails);
  }

  async addParticipant(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const participant = await this.chatService.addParticipant(req.params.chatId, req.body.userId, userId);
    res.status(201).json(participant);
  }

  async removeParticipant(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    await this.chatService.removeParticipant(req.params.chatId, req.params.userId, userId);
    res.status(204).send();
  }

  async getChatParticipants(req: Request, res: Response) {
    const participants = await this.chatService.getChatParticipants(req.params.chatId);
    res.status(200).json(participants);
  }

  async sendMessage(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const message = await this.chatService.sendMessage(req.params.chatId, userId, req.body);
    res.status(201).json(message);
  }

  async getChatMessages(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const messages = await this.chatService.getChatMessages(req.params.chatId, userId, page, limit);
    res.status(200).json(messages);
  }

  async getOrCreatePrivateChat(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const targetUserId = req.params.userId;
    const chat = await this.chatService.getOrCreatePrivateChat(userId, targetUserId);
    res.status(200).json({ id: chat.id });
  }
} 