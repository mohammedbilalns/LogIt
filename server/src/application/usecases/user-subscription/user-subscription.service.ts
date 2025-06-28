import { IUserSubscriptionRepository } from '../../../domain/repositories/user-subscription.repository.interface';
import { UserSubscription } from '../../../domain/entities/user-subscription.entity';
import { ISubscriptionRepository } from '../../../domain/repositories/subscription.repository.interface';
import { IUserSubscriptionService, UserSubscriptionWithPlan } from '../../../domain/services/user-subscription.service.interface';

export class UserSubscriptionServiceImpl implements IUserSubscriptionService {
  constructor(
    private userSubscriptionRepository: IUserSubscriptionRepository,
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  async createUserSubscription(data: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSubscription> {
    return this.userSubscriptionRepository.createUserSubscription(data);
  }

  async updateUserSubscription(id: string, data: Partial<UserSubscription>): Promise<UserSubscription | null> {
    return this.userSubscriptionRepository.updateUserSubscription(id, data);
  }

  async findActiveSubscriptionByUserId(userId: string): Promise<UserSubscriptionWithPlan | null> {
    const subscription = await this.userSubscriptionRepository.findActiveSubscriptionByUserId(userId);
    if (!subscription) return null;

    // Get the plan details
    const { data: plans } = await this.subscriptionRepository.findAll();
    const plan = plans.find(p => p.id === subscription.planId);

    return {
      ...subscription,
      plan
    };
  }

  async findSubscriptionsByUserId(userId: string): Promise<UserSubscription[]> {
    return this.userSubscriptionRepository.findSubscriptionsByUserId(userId);
  }

  async deactivateSubscription(id: string): Promise<UserSubscription | null> {
    return this.userSubscriptionRepository.deactivateSubscription(id);
  }

  async findExpiredSubscriptions(): Promise<UserSubscription[]> {
    return this.userSubscriptionRepository.findExpiredSubscriptions();
  }

  async getUserCurrentPlan(userId: string): Promise<import('../../../domain/entities/subscription.entity').SubscriptionPlan> {
    const activeSubscription = await this.findActiveSubscriptionByUserId(userId);
    
    if (activeSubscription?.plan) {
      return activeSubscription.plan;
    }

    // If no active subscription, return base plan
    const { data: plans } = await this.subscriptionRepository.findAll();
    const basePlan = plans.find(p => p.name.toLowerCase() === 'base');
    
    if (!basePlan) {
      throw new Error('Base plan not found');
    }

    return basePlan;
  }
} 