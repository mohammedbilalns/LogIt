import { chatService } from '@/application/services/chatService';

export async function createChat(data: { isGroup: boolean; name?: string; participants: string[] }) {
  return await chatService.createChat(data);
} 