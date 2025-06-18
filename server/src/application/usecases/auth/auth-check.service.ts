import { IAuthCheckService } from "../../../domain/services/auth-check.service.interface";
import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { ResourceNotFoundError } from "../../errors/resource.errors";
import { HttpResponse } from "../../../config/responseMessages";

export class AuthCheckService implements IAuthCheckService {
  constructor(private userRepository: IUserRepository) {}

  async checkUserBlocked(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new ResourceNotFoundError(HttpResponse.USER_NOT_FOUND);
    }

    if (user.isBlocked) {
      throw new Error(HttpResponse.USER_BLOCKED);
    }
  }
} 