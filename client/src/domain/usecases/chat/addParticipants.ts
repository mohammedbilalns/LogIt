import { chatService } from '@/application/services/chatService';

export async function addParticipants({ chatId, participants }: { chatId: string; participants: string[] }) {
  return await chatService.addParticipants({ chatId, participants });
} 