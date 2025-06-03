import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserNotFoundError } from '../../errors/auth.errors';
import { MongoUserRepository } from '../../../infrastructure/repositories/user.repository';

export class UserManagementService {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = new MongoUserRepository();
  }

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
}