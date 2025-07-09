export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  senderName?: string; // For chat notifications
} 