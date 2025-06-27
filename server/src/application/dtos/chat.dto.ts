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
  media?: string;
  log?: string;
  replyTo?: string;
} 