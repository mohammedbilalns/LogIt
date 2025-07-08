import { chatService } from '@/application/services/chatService';

export async function sendMessage({ chatId, content }: { chatId: string; content: string }) {
  return await chatService.sendMessage({ chatId, content });
} 