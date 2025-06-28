export interface ChatParticipants {
    id :string ; 
    chatId:string; 
    userId: string; 
    role:'admin'| 'member' | 'removed-user' | 'left-user';
    joinedAt: Date; 
    isMuted?: boolean;
    isBlocked?: boolean; 
    leftAt?: string; 
}