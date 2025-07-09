import { Notification } from "../entities/notification.entity";
import {  IBaseRepository } from "./base.repository.interface";

export interface INotificationRepository extends IBaseRepository<Notification> {
  findByUserId(userId: string, limit?: number): Promise<Notification[]>;
  findByUserIdPaginated(userId: string, page?: number, limit?: number): Promise<{ notifications: Notification[]; total: number }>;
  markAsRead(id: string): Promise<Notification | null>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}
