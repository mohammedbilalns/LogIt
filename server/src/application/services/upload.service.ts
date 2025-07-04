import { uploadBufferToCloudinary } from '../../config/cloudinary';
import { IUploadService } from '../../domain/services/upload.service.interface';

export class UploadService implements IUploadService {
  async uploadImage(buffer: Buffer, folder: string = 'uploads'): Promise<string> {
    const result = await uploadBufferToCloudinary(buffer, folder);
    return result.secure_url;
  }

  async uploadProfileImage(buffer: Buffer): Promise<string> {
    return this.uploadImage(buffer, 'profile-images');
  }
} 