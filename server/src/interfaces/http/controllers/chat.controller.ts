import { Request, Response } from "express";
import { IChatService } from "../../../domain/services/chat.service.interface";
import { HttpStatus } from "../../../constants/statusCodes";

export class ChatController {
  constructor(private chatService: IChatService) {}

  async createChat(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const chat = await this.chatService.createChat(userId, req.body);
    res.status(HttpStatus.CREATED).json(chat);
  }

  async createGroupChat(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const chat = await this.chatService.createGroupChat(userId, req.body);
    res.status(HttpStatus.CREATED).json(chat);
  }

  
  async getUserChats(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const result = await this.chatService.getUserChats(userId, page, limit);
    res.status(HttpStatus.OK).json(result);
  }

  async getChatDetails(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
    const chatDetails = await this.chatService.getChatDetails(req.params.chatId, userId, page, limit);
    res.status(HttpStatus.OK).json(chatDetails);
  }

  async addParticipant(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const participants = req.body.participants;
    const addedParticipants = await this.chatService.addParticipant(req.params.chatId, participants, userId);
    res.status(HttpStatus.CREATED).json(addedParticipants);
  }

  async removeParticipant(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    await this.chatService.removeParticipant(req.params.chatId, req.params.userId, userId);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  async getChatParticipants(req: Request, res: Response) {
    const participants = await this.chatService.getChatParticipants(req.params.chatId);
    res.status(HttpStatus.OK).json(participants);
  }

  async sendMessage(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const message = await this.chatService.sendMessage(req.params.chatId, userId, req.body);
    res.status(HttpStatus.CREATED).json(message);
  }

  async getOrCreatePrivateChat(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const targetUserId = req.params.userId;
    const chat = await this.chatService.getOrCreatePrivateChat(userId, targetUserId);
    res.json({ id: chat.id });
  }

  async getUserGroupChats(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const result = await this.chatService.getUserGroupChats(userId, page, limit);
    res.json(result);
  }

  async updateGroupName(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const { name } = req.body;
    const chat = await this.chatService.updateGroupName(req.params.chatId, userId, name);
    res.json(chat);
  }

  async promoteParticipant(req: Request, res: Response) {
    const userId = req.params.userId;
    const requesterId = (req.user as { id: string }).id;
    const participant = await this.chatService.promoteParticipant(req.params.chatId, userId, requesterId);
    res.json(participant);
  }

  async leaveGroup(req: Request, res: Response) {
    const userId = (req.user as { id: string }).id;
    const result = await this.chatService.leaveGroup(req.params.chatId, userId);
    res.json(result);
  }
} 