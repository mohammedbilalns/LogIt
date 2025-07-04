import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { IUserManagementService } from '../../domain/services/usermanagement.service.interface';
import { UserNotFoundError } from '../errors/auth.errors';
import {
  FetchUsersOptions,
  UserResponse,
  UpdateUserData,
  UsersListResponse,
} from '../dtos';

export class UserManagementService implements IUserManagementService {
  constructor(private userRepository: IUserRepository) {}

  async fetchUsers(options: FetchUsersOptions = {}): Promise<UsersListResponse> {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const result = await this.userRepository.findAll({
      page,
      limit,
      search,
      sortBy,
      sortOrder
    });

    const userResponses: UserResponse[] = result.data.map((user: User) => {
      const userCopy = { ...user };
      delete userCopy.password;
      return userCopy as UserResponse;
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      data: userResponses,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    const userCopy = { ...user };
    delete userCopy.password;
    return userCopy as UserResponse;
  }

  async updateUser(userId: string, updateData: UpdateUserData): Promise<UserResponse> {
    const user = await this.userRepository.update(userId, updateData);
    if (!user) {
      throw new UserNotFoundError();
    }
    const userCopy = { ...user };
    delete userCopy.password;
    return userCopy as UserResponse;
  }
}