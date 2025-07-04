import { Request, Response } from "express";
import { IUserManagementService } from "../../../domain/services/usermanagement.service.interface";
import { HttpStatus } from "../../../constants/statusCodes";

export class AdminController {
  constructor(private userManagementService: IUserManagementService) {}

  fetchUsers = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;
    const search = typeof req.query.search === "string" ? req.query.search : "";

    const result = await this.userManagementService.fetchUsers({
      page,
      limit,
      search,
    });
    res.status(HttpStatus.OK).json(result);
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id: userId } = req.params;
    const updatedUser = await this.userManagementService.updateUser(userId, {
      ...req.body,
    });
    res.status(HttpStatus.OK).json(updatedUser);
  };
}
