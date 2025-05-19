import { Request, Response } from "express";
import { UserManagementService } from "../../../application/usecases/usermanagement/usermanagement.service";
import { logger } from "../../../utils/logger";

export class AdminController {
  constructor(private userManagementService: UserManagementService) {}

  fetchUsers = async (req: Request, res: Response): Promise<void> => {
    console.log('fetchUsers called ');
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';

      const result = await this.userManagementService.fetchUsers(page, limit, search);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.red('FETCH_USERS_ERROR', error.message);
        res.status(400).json({ message: error.message });
      } else {
        logger.red('FETCH_USERS_ERROR', 'Internal server error');
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    const {id} = req.params;
    const updatedUser = await this.userManagementService.updateUser(id, {...req.body});
    res.json(updatedUser);
  }
}
