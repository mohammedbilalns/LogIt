import { IBaseRepository } from "./base.repository.interface";
import { User } from "../entities/user.entity";

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  updateVerificationStatus(
    userId: string,
    isVerified: boolean
  ): Promise<User | null>;
  updatePassword(userId: string, hashedPassword: string): Promise<User | null>;
  verifyPassword(userId: string, password: string): Promise<boolean>;
  deleteByEmail(email: string): Promise<void>;
  isUserBlocked(userId: string): Promise<boolean>;
}
