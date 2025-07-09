import { Notification } from "../entities/notification.entity";

export interface INotificationService {
  getNotifications(userId: string, page?: number, limit?: number): Promise<{ notifications: Notification[]; total: number }>;
  markAsRead(id: string): Promise<Notification | null>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  createNotification(notification: Omit<Notification, "id" | "createdAt" | "readAt">): Promise<Notification>;
}
