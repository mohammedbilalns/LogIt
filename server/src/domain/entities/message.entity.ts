import { MessageMedia } from './message-media.entity';

export interface Message{
    id: string; 
    chatId: string;
    senderId: string;
    content?:string; 
    media?: MessageMedia;
    log?: string;
    replyTo?: string; 
    deletedFor:string[];
    seenBy: string[];
    createdAt: Date;
    updatedAt: Date; 
}


