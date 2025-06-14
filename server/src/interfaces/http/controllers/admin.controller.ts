import { Request, Response } from "express";
import { UserManagementService } from "../../../application/usecases/usermanagement/usermanagement.service";

export class AdminController {
  constructor(private userManagementService: UserManagementService) {}

  fetchUsers = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await this.userManagementService.fetchUsers(
      page,
      limit,
      search
    );
    res.json(result);
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updatedUser = await this.userManagementService.updateUser(id, {
      ...req.body,
    });
    res.json(updatedUser);
  };
}
