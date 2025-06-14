import { Request, Response } from "express";
import { UserService } from "../../../application/usecases/usermanagement/user.service";

export class UserController {
  constructor(private userService: UserService) {}

  async updateProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    const { name, profileImage, profession, bio } = req.body;
    const updatedUser = await this.userService.updateProfile(userId, {
      name,
      profileImage,
      profession,
      bio,
    });

    return res.json(updatedUser);
  }

  async changePassword(req: Request, res: Response) {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    await this.userService.changePassword(userId, currentPassword, newPassword);
    return res.json({ message: "Password updated successfully" });
  }

  async getHome(req: Request, res: Response) {
    const userId = req.user?.id;

    const data = await this.userService.getHomeData(userId);
    return res.json(data);
  }
}
