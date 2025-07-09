import { chatService } from '@/application/services/chatService';

export async function sendMessage({ 
  chatId, 
  content, 
  media 
}: { 
  chatId: string; 
  content?: string; 
  media?: any 
}) {
  return await chatService.sendMessage({ chatId, content, media });
} 