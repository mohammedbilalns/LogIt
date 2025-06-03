import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserNotFoundError, InvalidPasswordError, PasswordMismatchError, InvalidProfileDataError, UserBlockedError } from '../../../application/errors/user.errors';
import { MongoUserRepository } from '../../../infrastructure/repositories/user.repository';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = new MongoUserRepository();
  }

  async checkUserBlocked(userId: string): Promise<void> {
    const isBlocked = await this.userRepository.isUserBlocked(userId);
    if (isBlocked) {
      throw new UserBlockedError();
    }
  }

  async updateProfile(userId: string, profileData: {
    name?: string;
    profileImage?: string;
    profession?: string;
    bio?: string;
  }): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Check if user is blocked
    await this.checkUserBlocked(userId);

    // Validate profile data
    if (profileData.name && profileData.name.length < 2) {
      throw new InvalidProfileDataError('Name must be at least 2 characters long');
    }

    if (profileData.bio && profileData.bio.length > 500) {
      throw new InvalidProfileDataError('Bio must not exceed 500 characters');
    }

    const updatedUser = await this.userRepository.updateById(userId, profileData);
    if (!updatedUser) {
      throw new UserNotFoundError();
    }

    return updatedUser;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Check if user is blocked
    await this.checkUserBlocked(userId);

    // Verify old password
    const isPasswordValid = await this.userRepository.verifyPassword(userId, oldPassword);
    if (!isPasswordValid) {
      throw new InvalidPasswordError('Current password is incorrect');
    }

    // Check if new password is same as old password
    const isSamePassword = await this.userRepository.verifyPassword(userId, newPassword);
    if (isSamePassword) {
      throw new PasswordMismatchError('New password cannot be the same as current password');
    }

    // Validate new password requirements
    if (newPassword.length < 8) {
      throw new InvalidPasswordError('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(newPassword)) {
      throw new InvalidPasswordError('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(newPassword)) {
      throw new InvalidPasswordError('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(newPassword)) {
      throw new InvalidPasswordError('Password must contain at least one number');
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      throw new InvalidPasswordError('Password must contain at least one special character');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    const updatedUser = await this.userRepository.updatePassword(userId, hashedPassword);
    if (!updatedUser) {
      throw new UserNotFoundError();
    }

    return updatedUser;
  }
} 