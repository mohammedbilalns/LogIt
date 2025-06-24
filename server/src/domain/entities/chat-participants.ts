export interface ChatParticipants {
    id :string ; 
    chatId:string; 
    userId: string; 
    role:'admin'| 'member';
    joinedAt: Date; 
    isMuted?: boolean;
    isBlocked?: boolean; 
    leftAt?: string; 
}