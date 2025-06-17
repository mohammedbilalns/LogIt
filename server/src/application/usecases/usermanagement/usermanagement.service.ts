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
    const result = await this.userRepository.findAll({
      page,
      limit,
      search,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    return {
      ...result,
      data: result.data.map(user => ({
        ...user,
        password: undefined
      }))
    };
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return {
      ...user,
      password: undefined
    };
  }

  async updateUser(userId: string, updateData: Partial<User>) {
    const user = await this.userRepository.update( userId, updateData);
    if (!user) {
      throw new UserNotFoundError();
    }
    return {
      ...user,
      password: undefined
    };
  }
}