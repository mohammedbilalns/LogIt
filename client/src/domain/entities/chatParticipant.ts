export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  role: 'admin' | 'member' | 'removed-user' | 'left-user';
  joinedAt: string;
  isMuted?: boolean;
  isBlocked?: boolean;
  leftAt?: string;
  name: string;
  profileImage?: string;
}
