export interface MessageMedia {
  id?: string;
  mediaType: 'image' | 'video' | 'audio';
  messageId: string;
  size: number;
  uploadedAt: Date;
  url: string;
}

