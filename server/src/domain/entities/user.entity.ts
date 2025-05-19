export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isVerified: boolean;
  isBlocked?: boolean;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string;
  profileImage?: string;
  provider?: 'local' | 'google';
  role: 'user' | 'admin' | 'superadmin';
}

export interface UserWithoutPassword extends Omit<User, 'password'> {} 