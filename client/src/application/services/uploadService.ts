import { uploadServiceImpl } from '@/infrastructure/services/upload.service';

export const uploadService = {
  uploadImage: (file: File): Promise<string> => {
    return uploadServiceImpl.uploadImage(file);
  },
}; 