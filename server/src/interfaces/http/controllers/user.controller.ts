import { Request, Response } from "express";
import { IUserService } from "../../../domain/services/user.service.interface";
import { HttpStatus } from "../../../config/statusCodes";
import { HttpResponse } from "../../../config/responseMessages";

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

  
}
