import { SubscriptionPlan } from '../entities/subscription.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ISubscriptionRepository extends IBaseRepository<SubscriptionPlan> {} 