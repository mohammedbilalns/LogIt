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
    } catch (error: any) {
      logger.red('Error changing password:', error);
       
      if (error.name === 'UserNotFoundError') {
        return res.status(404).json({ message: 'User account not found' });
      }
      
      if (error.name === 'InvalidPasswordError') {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      if (error.name === 'PasswordMismatchError') {
        return res.status(400).json({ message: 'New password cannot be the same as current password' });
      }

      if (error.name === 'UserBlockedError') {
        return res.status(403).json({ message: 'Your account has been blocked' });
      }

      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 