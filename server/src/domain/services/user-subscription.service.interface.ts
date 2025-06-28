import { UserSubscription } from "../entities/user-subscription.entity";
import { SubscriptionPlan } from "../entities/subscription.entity";

export interface UserSubscriptionWithPlan extends UserSubscription {
  plan?: SubscriptionPlan;
}

export interface IUserSubscriptionService {
  createUserSubscription(data: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSubscription>;
  updateUserSubscription(id: string, data: Partial<UserSubscription>): Promise<UserSubscription | null>;
  findActiveSubscriptionByUserId(userId: string): Promise<UserSubscriptionWithPlan | null>;
  findSubscriptionsByUserId(userId: string): Promise<UserSubscription[]>;
  deactivateSubscription(id: string): Promise<UserSubscription | null>;
  findExpiredSubscriptions(): Promise<UserSubscription[]>;
  getUserCurrentPlan(userId: string): Promise<SubscriptionPlan>;
} 