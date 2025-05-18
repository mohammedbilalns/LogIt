import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserNotFoundError } from '../../errors/auth.errors';

export class UserManagementService {
  constructor(private userRepository: IUserRepository) {}

  async fetchUsers(page: number = 1, limit: number = 10, search: string = '') {
    return await this.userRepository.fetch(page, limit, search);
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }
    return {
      ...user,
      password: undefined
    };
  }

  async updateUser(id: string, updateData: Partial<User>) {
    const user = await this.userRepository.updateById(id, updateData);
    if (!user) {
      throw new UserNotFoundError();
    }
    return {
      ...user,
      password: undefined
    };
  }

  async deleteUser(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    await this.userRepository.delete(email);
    return { message: 'User deleted successfully' };
  }
}