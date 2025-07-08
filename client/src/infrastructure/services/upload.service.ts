import axiosInstance from '@/infrastructure/api/axios';

export const uploadServiceImpl = {
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
}; 