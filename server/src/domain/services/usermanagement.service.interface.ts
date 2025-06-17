import {
  FetchUsersOptions,
  UserResponse,
  UpdateUserData,
  UsersListResponse,
} from "../../application/dtos";

export interface IUserManagementService {
  fetchUsers(options?: FetchUsersOptions): Promise<UsersListResponse>;

  getUserById(userId: string): Promise<UserResponse>;

  updateUser(userId: string, updateData: UpdateUserData): Promise<UserResponse>;
} 