export interface Chat {
  id: string;
  isGroup: boolean;
  name?: string;
  creator?: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    userId: string;
    name: string;
    profileImage?: string;
    role: string;
  }>;
  lastMessageDetails?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount?: number;
}