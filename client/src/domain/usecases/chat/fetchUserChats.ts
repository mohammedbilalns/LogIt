import { chatService } from '@/application/services/chatService';

export async function fetchUserChats({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
  return await chatService.fetchUserChats({ page, limit });
} 