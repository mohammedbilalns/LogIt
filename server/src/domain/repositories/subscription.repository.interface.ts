import { SubscriptionPlan } from '../entities/subscription.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ISubscriptionRepository extends IBaseRepository<SubscriptionPlan> {
  findByName(name: string): Promise<SubscriptionPlan | null>;
  findByDetails(price: number, maxLogsPerMonth: number, maxArticlesPerMonth: number): Promise<SubscriptionPlan | null>;
} 