import { uploadService } from '@/application/services/uploadService';

export async function uploadImage(file: File): Promise<string> {
  return await uploadService.uploadImage(file);
} 