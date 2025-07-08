import { chatService } from '@/application/services/chatService';

export async function fetchUserGroupChats({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
  return await chatService.fetchUserGroupChats({ page, limit });
} 