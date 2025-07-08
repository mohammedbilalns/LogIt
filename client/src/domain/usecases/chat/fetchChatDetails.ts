import { chatService } from '@/application/services/chatService';

export async function fetchChatDetails({ chatId, page = 1, limit = 15 }: { chatId: string; page?: number; limit?: number }) {
  return await chatService.fetchChatDetails({ chatId, page, limit });
} 