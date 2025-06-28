import { UserSubscription } from '../entities/user-subscription.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IUserSubscriptionRepository extends IBaseRepository<UserSubscription> {
  createUserSubscription(data: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSubscription>;
  updateUserSubscription(id: string, data: Partial<UserSubscription>): Promise<UserSubscription | null>;
  findActiveSubscriptionByUserId(userId: string): Promise<UserSubscription | null>;
  findSubscriptionsByUserId(userId: string): Promise<UserSubscription[]>;
  deactivateSubscription(id: string): Promise<UserSubscription | null>;
  findExpiredSubscriptions(): Promise<UserSubscription[]>;
} 