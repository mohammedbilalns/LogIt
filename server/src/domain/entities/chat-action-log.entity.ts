export interface ChatActionLog {
  id: string;
  chatId: string;
  actionBy: string;
  action: 'added' | 'removed' | 'muted' | 'unmuted' | 'renamed' | 'left' | 'promoted';
  targetUser?: string;
  message?: string;
  createdAt: Date;
} 