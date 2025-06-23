import { User, UserInfoWithRelationship } from "../entities/user.entity";
import {
  UpdateProfileData,
  ChangePasswordData,
  HomeData,
} from "../../application/dtos";

export interface IUserService {
  checkUserBlocked(userId: string): Promise<void>;

  updateProfile(
    userId: string | undefined,
    profileData: UpdateProfileData
  ): Promise<User>;

  changePassword(
    userId: string | undefined,
    passwordData: ChangePasswordData
  ): Promise<User>;

  getHomeData(userId: string | undefined): Promise<HomeData>;

  getUserInfoWithRelationship(
    requestedUserId: string,
    targetUserId: string
  ): Promise<UserInfoWithRelationship>;
}
