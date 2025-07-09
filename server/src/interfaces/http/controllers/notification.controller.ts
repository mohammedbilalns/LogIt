import { Request, Response } from "express";
import { INotificationService } from "../../../domain/services/notification.service.interface";
import { HttpStatus } from "../../../constants/statusCodes";

export class NotificationController {
  constructor(private notificationService: INotificationService) {}

  getNotifications = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
    }
    const result = await this.notificationService.getNotifications(userId, page, limit);
    return res.status(HttpStatus.OK).json(result);
  };

  markAsRead = async (req: Request, res: Response) => {
    const { id } = req.params;
    const notification = await this.notificationService.markAsRead(id);
    if (!notification) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Notification not found" });
    }
    return res.status(HttpStatus.OK).json(notification);
  };

  markAllAsRead = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
    }
    await this.notificationService.markAllAsRead(userId);
    return res.status(HttpStatus.OK).json({ message: "All notifications marked as read" });
  };

  getUnreadCount = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
    }
    const count = await this.notificationService.getUnreadCount(userId);
    return res.status(HttpStatus.OK).json({ unreadCount: count });
  };
}
