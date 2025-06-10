import { IBaseRepository } from './base.repository.interface';
import { User } from '../entities/user.entity';

export interface IUserRepository extends IBaseRepository<User> {
  // User-specific methods
  findByEmail(email: string): Promise<User | null>;
  updateVerificationStatus(id: string, isVerified: boolean): Promise<User | null>;
  updatePassword(id: string, hashedPassword: string): Promise<User | null>;
  verifyPassword(id: string, password: string): Promise<boolean>;
  deleteByEmail(email: string): Promise<void>;
  isUserBlocked(id: string): Promise<boolean>;
  updateById(id: string, update: Partial<User>): Promise<User | null>;
} 