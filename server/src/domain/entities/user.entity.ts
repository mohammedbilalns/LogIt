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
  profession?: string;
  bio?: string;
  provider?: 'local' | 'google';
  role: 'user' | 'admin' | 'superadmin';
}

export type UserWithoutPassword = Omit<User, 'password'> 