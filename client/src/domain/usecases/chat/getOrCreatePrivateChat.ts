import { chatService } from '@/application/services/chatService';

export async function getOrCreatePrivateChat(userId: string) {
  return await chatService.getOrCreatePrivateChat(userId);
} 