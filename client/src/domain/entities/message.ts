export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content?: string;
  media?: string;
  log?: string;
  replyTo?: string;
  deletedFor: string[];
  seenBy: string[];
  createdAt: string;
  updatedAt: string;
}