import { v2 as cloudinary } from 'cloudinary';
import env from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export function uploadBufferToCloudinary(buffer: Buffer, folder: string): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result as { secure_url: string });
        else reject(new Error('No result from Cloudinary'));
      }
    );
    stream.end(buffer);
  });
} 