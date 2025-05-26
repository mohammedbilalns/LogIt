import { Request, Response } from 'express';
import { UserService } from '../../../application/usecases/usermanagement/user.service';
import { logger } from '../../../utils/logger';

export class UserController {
  constructor(private userService: UserService) {}

  async updateProfile(req: Request, res: Response) {
    try {
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
    } catch (error: any) {
      logger.red('Error updating profile:', error);
      
      if (error.name === 'UserNotFoundError') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.name === 'InvalidProfileDataError') {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      logger.cyan("Change password request ", "dsf")
      const userId = req.user?.id;
      logger.cyan("User id " , String(userId))
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required' });
      }

      await this.userService.changePassword(userId, oldPassword, newPassword);
      return res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
      logger.red('Error changing password:', error);
       
      if (error.name === 'UserNotFoundError') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.name === 'InvalidPasswordError' || error.name === 'PasswordMismatchError') {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 