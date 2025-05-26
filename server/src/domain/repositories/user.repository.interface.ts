import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateVerificationStatus(id: string, isVerified: boolean): Promise<User | null>;
  updatePassword(id: string, hashedPassword: string): Promise<User | null>;
  verifyPassword(id: string, password: string): Promise<boolean>;
  updateById(id: string, update: Partial<User>): Promise<User | null>;
  delete(email: string): Promise<void>;
  fetch(page?: number, limit?: number, search?: string): Promise<{ users: User[]; total: number; }>;
} 