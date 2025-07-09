export interface IUploadService {
  uploadImage(buffer: Buffer, folder?: string): Promise<string>;
  uploadAudio(buffer: Buffer, folder?: string): Promise<string>;
} 