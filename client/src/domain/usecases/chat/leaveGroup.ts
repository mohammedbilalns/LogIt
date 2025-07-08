import { chatService } from '@/application/services/chatService';

export async function leaveGroup(chatId: string) {
  return await chatService.leaveGroup(chatId);
} 