import { Request, Response } from 'express';
import { UserService } from '../../../application/usecases/usermanagement/user.service';


export class UserController {
  constructor(private userService: UserService) {}

  async updateProfile(req: Request, res: Response) {
   
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, profileImage, profession, bio } = req.body;
      const updatedUser = await this.userService.updateProfile(userId, {
        name,
        profileImage,
        profession,
        bio
      });

      return res.json(updatedUser);
  }

  async changePassword(req: Request, res: Response) {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      await this.userService.changePassword(userId, currentPassword, newPassword);
      return res.json({ message: 'Password updated successfully' });
    
  }

  async getHome(req:Request, res: Response){
 
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      console.log(userId)
     const data =  await this.userService.getHomeData(userId)
     return res.json(data)
  }
} 