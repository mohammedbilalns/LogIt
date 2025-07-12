import api from '@/infrastructure/api/axios';
import { Notification } from '@/types/notification.types';

export const notificationService = {
  async fetchNotifications(
    page = 1,
    limit = 10
  ): Promise<{ notifications: Notification[]; total: number }> {
    const res = await api.get<{ notifications: Notification[]; total: number }>(
      `/notifications?page=${page}&limit=${limit}`
    );
    return res.data;
  },
  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}`);
  },
  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/mark-all');
  },
  async fetchUnreadCount(): Promise<number> {
    const res = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return res.data.unreadCount;
  },
};
