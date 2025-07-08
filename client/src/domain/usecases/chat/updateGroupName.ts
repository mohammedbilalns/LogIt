import { chatService } from '@/application/services/chatService';

export async function updateGroupName({ chatId, name }: { chatId: string; name: string }) {
  return await chatService.updateGroupName({ chatId, name });
} 