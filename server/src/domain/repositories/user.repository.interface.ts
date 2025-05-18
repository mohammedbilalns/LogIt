import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateVerificationStatus(id: string, isVerified: boolean): Promise<User | null>;
  updatePassword(id: string, password: string): Promise<User | null>;
  delete(email: string): Promise<void>;
} 