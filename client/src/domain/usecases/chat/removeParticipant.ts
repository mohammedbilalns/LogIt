import { chatService } from '@/application/services/chatService';

export async function removeParticipant({ chatId, userId }: { chatId: string; userId: string }) {
  return await chatService.removeParticipant({ chatId, userId });
} 