import axiosInstance from '@/infrastructure/api/axios';

export const uploadService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/upload/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url;
  },

  async uploadAudio(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/upload/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url;
  },
}; 