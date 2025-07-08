import { chatService } from '@/application/services/chatService';

export async function promoteParticipant({ chatId, userId }: { chatId: string; userId: string }) {
  return await chatService.promoteParticipant({ chatId, userId });
} 