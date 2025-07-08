import { chatService } from '@/application/services/chatService';

export async function createGroupChat(data: { name: string; participants: string[] }) {
  return await chatService.createGroupChat(data);
} 