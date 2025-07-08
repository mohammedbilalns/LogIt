export interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isBlocked: boolean; 
  createdAt: string;
  updatedAt: string;
  role: 'user' | 'admin' | 'superadmin';
  profession: string;
  bio: string;
  profileImage?: string;
  provider: string;
}