export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string;
  profileImage?: string;
  provider?: 'local' | 'google';
}

export interface UserWithoutPassword extends Omit<User, 'password'> {} 