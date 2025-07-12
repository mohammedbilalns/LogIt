import { API_ROUTES } from '@/constants/routes';
import axiosInstance from '@/infrastructure/api/axios';

export const uploadService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(API_ROUTES.UPLOAD.UPLOAD_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  },

  async uploadAudio(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(API_ROUTES.UPLOAD.UPLOAD_AUDIO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  },
};
