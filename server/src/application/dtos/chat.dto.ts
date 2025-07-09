import { MessageMedia } from '../../domain/entities/message-media.entity';

export interface CreateChatDto {
  isGroup: boolean;
  name?: string;
  participants: string[]; 
}

export interface CreateGroupChatDto {
  name: string;
  participants: string[]; 
}

export interface SendMessageDto {
  content?: string;
  media?: MessageMedia;
  log?: string;
  replyTo?: string;
} 