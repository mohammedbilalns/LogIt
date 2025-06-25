export interface CreateChatDto {
  isGroup: boolean;
  name?: string;
  participants: string[]; // array of user IDs
}

export interface SendMessageDto {
  content?: string;
  media?: string;
  log?: string;
  replyTo?: string;
} 