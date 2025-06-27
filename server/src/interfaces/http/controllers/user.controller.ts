import { Request, Response } from "express";
import { IUserService } from "../../../domain/services/user.service.interface";
import { HttpStatus } from "../../../config/statusCodes";
import { HttpResponse } from "../../../config/responseMessages";
import { onlineUsers } from '../../../config/socket';

export class UserController {
  constructor(private userService: IUserService) {}

  async updateProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    const { name, profileImage, profession, bio } = req.body;
    const updatedUser = await this.userService.updateProfile(userId, {
      name,
      profileImage,
      profession,
      bio,
    });

    return res.status(HttpStatus.OK).json(updatedUser);
  }

  async changePassword(req: Request, res: Response) {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    await this.userService.changePassword(userId, {
      oldPassword: currentPassword,
      newPassword,
    });
    return res.json({ message: HttpResponse.PASSWORD_UPDATED });
  }

  async getHome(req: Request, res: Response) {
    const userId = req.user?.id;

    const data = await this.userService.getHomeData(userId);
    return res.status(HttpStatus.OK).json(data);
  }


  async getUserInfoWithRelationship(req: Request, res: Response) {
    const requestedUserId = req.user!.id;
    const targetUserId = req.params.id;
    const data = await this.userService.getUserInfoWithRelationship(requestedUserId, targetUserId);
    return res.status(HttpStatus.OK).json(data);
  }

  async getOwnStats(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await this.userService.getUserStats(userId);
    return res.status(HttpStatus.OK).json(data);
  }

  async getOnlineStatus(req: Request, res: Response) {
    const targetUserId = req.params.id;
    const isOnline = onlineUsers.has(targetUserId);
    return res.json({ online: isOnline });
  }

  async getUsersForGroupChat(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: HttpResponse.AUTHENTICATION_REQUIRED });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    
    const users = await this.userService.getUsersForGroupChat(currentUserId, page, limit, search);
    return res.status(HttpStatus.OK).json(users);
  }
}
