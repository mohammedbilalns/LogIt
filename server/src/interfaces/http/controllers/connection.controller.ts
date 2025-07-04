import { Request, Response } from "express";
import { IConnectionService } from "../../../domain/services/connection.service.interface";
import { HttpStatus } from "../../../constants/statusCodes";
import { HttpResponse } from "../../../constants/responseMessages";

export class ConnectionController {
  constructor(private connectionService: IConnectionService) {}

  async fetchFollowers(req: Request, res: Response) {
    const userId = req.params.userId || req.user!.id;
    const followers = await this.connectionService.fetchFollowers(userId, req.user!.id);
    return res.status(HttpStatus.OK).json(followers);
  }

  async fetchFollowing(req: Request, res: Response) {
    const userId = req.params.userId || req.user!.id;
    const following = await this.connectionService.fetchFollowing(userId);
    return res.status(HttpStatus.OK).json(following);
  }

  async followUser(req: Request, res: Response) {
    const userId = req.user!.id;
    const { targetUserId } = req.body;
    await this.connectionService.followUser(userId, targetUserId);
    return res
      .status(HttpStatus.OK)
      .json({ message: HttpResponse.FOLLOWED_USER });
  }

  async unfollowUser(req: Request, res: Response) {
    const userId = req.user!.id;
    const { targetUserId } = req.body;
    await this.connectionService.unfollowUser(userId, targetUserId);
    return res
      .status(HttpStatus.OK)
      .json({ message: HttpResponse.UNFOLLOWED_USER });
  }

  async blockUser(req: Request, res: Response) {
    const userId = req.user!.id;
    const { targetUserId } = req.body;
    await this.connectionService.blockUser(userId, targetUserId);
    return res
      .status(HttpStatus.OK)
      .json({ message: HttpResponse.BLOCKED_USER });
  }

  async unblockUser(req: Request, res: Response) {
    const userId = req.user!.id;
    const { targetUserId } = req.body;
    await this.connectionService.unblockUser(userId, targetUserId);
    return res
      .status(HttpStatus.OK)
      .json({ message: HttpResponse.UNBLOCKED_USER });
  }
}
