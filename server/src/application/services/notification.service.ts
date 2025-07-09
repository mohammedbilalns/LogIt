import { INotificationService } from "../../domain/services/notification.service.interface";
import { INotificationRepository } from "../../domain/repositories/notifiction.repository.interface";
import { Notification } from "../../domain/entities/notification.entity";
import { emitNotificationToUser } from "../../interfaces/http/sockets/notification.handler";
import { socketConfig } from "../../server";

export class NotificationService implements INotificationService {
  private notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async getNotifications(userId: string, page = 1, limit = 10): Promise<{ notifications: Notification[]; total: number }> {
    return this.notificationRepository.findByUserIdPaginated(userId, page, limit);
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async createNotification(notification: Omit<Notification, "id" | "createdAt" | "readAt">): Promise<Notification> {
    const created = await this.notificationRepository.create(notification);
    emitNotificationToUser(socketConfig.io, created.userId, created);
    return created;
  }
}
