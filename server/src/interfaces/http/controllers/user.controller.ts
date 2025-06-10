import { Request, Response } from 'express';
import { UserService } from '../../../application/usecases/usermanagement/user.service';
import { logger } from '../../../utils/logger';

interface CustomError extends Error {
  name: 'UserNotFoundError' | 'InvalidPasswordError' | 'PasswordMismatchError' | 'UserBlockedError' | 'InvalidProfileDataError';
}

export class UserController {
  constructor(private userService: UserService) {}

  async updateProfile(req: Request, res: Response) {
    console.log("update profile");
    try {
      const userId = req.user?.id;
      console.log("userId", userId);
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, profileImage, profession, bio } = req.body;
      console.log("req.body", req.body);
      const updatedUser = await this.userService.updateProfile(userId, {
        name,
        profileImage,
        profession,
        bio
      });

      return res.json(updatedUser);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.red('Error updating profile:', errorMessage);
      
      if (error instanceof Error && (error as CustomError).name === 'UserNotFoundError') {
        logger.red('User not found:', errorMessage);
        return res.status(404).json({ message: errorMessage });
      }
      
      if (error instanceof Error && (error as CustomError).name === 'InvalidProfileDataError') {
        return res.status(400).json({ message: errorMessage });
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.red('Error changing password:', errorMessage);
       
      if (error instanceof Error && (error as CustomError).name === 'UserNotFoundError') {
        return res.status(404).json({ message: 'User account not found' });
      }
      
      if (error instanceof Error && (error as CustomError).name === 'InvalidPasswordError') {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      if (error instanceof Error && (error as CustomError).name === 'PasswordMismatchError') {
        return res.status(400).json({ message: 'New password cannot be the same as current password' });
      }

      if (error instanceof Error && (error as CustomError).name === 'UserBlockedError') {
        return res.status(403).json({ message: 'Your account has been blocked' });
      }

      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getHome(req:Request, res: Response){
    try{
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      console.log(userId)
     const data =  await this.userService.getHomeData(userId)
     return res.json(data)
    }catch(error: unknown){
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occured '
      logger.red("Error fetching Home data",errorMessage)
      return res.status(500).json({message:'Internal Server Error'})

    }
  }
} 