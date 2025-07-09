import { User, UserInfoWithRelationship } from "../entities/user.entity";
import {
  UpdateProfileData,
  ChangePasswordData,
  HomeData,
} from "../../application/dtos";
import { SubscriptionPlan } from "../entities/subscription.entity";
import { UserSubscriptionWithPlan } from "./user-subscription.service.interface";

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

  getUserStats(userId: string): Promise<{ 
    followersCount: number, 
    followingCount: number, 
    articlesCount: number,
    currentPlan: SubscriptionPlan,
    activeSubscription: UserSubscriptionWithPlan | null
  }>;

  getUsersForGroupChat(
    currentUserId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: User[]; total: number; hasMore: boolean }>;

  
}
