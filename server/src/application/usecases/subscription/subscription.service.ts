import { ISubscriptionService } from '../../../domain/services/subsription.service.interface';
import { ISubscriptionRepository } from '../../../domain/repositories/subscription.repository.interface';
import { SubscriptionPlan } from '../../../domain/entities/subscription.entity';
import { ResourceLimitExceededError, ResourceNotFoundError } from '../../errors/resource.errors';
import { HttpResponse } from '../../../constants/responseMessages';

export class SubscriptionService implements ISubscriptionService {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async fetchSubscriptions(): Promise<SubscriptionPlan[]> {
    const { data } = await this.subscriptionRepository.findAll();
    return data;
  }

  async updateSubscription(id: string, data: Partial<Omit<SubscriptionPlan, 'id'>>): Promise<SubscriptionPlan | null> {
    const all = (await this.subscriptionRepository.findAll()).data;
    const plan = all.find(p => p.id === id);
    if (!plan) return null;
    const base = all.find(p => p.name.toLowerCase() === 'base');
    const plus = all.find(p => p.name.toLowerCase() === 'plus');
    const pro = all.find(p => p.name.toLowerCase() === 'pro');
    if (!base || !plus || !pro) throw new ResourceNotFoundError(HttpResponse.SUBSCRIPTION_PLANS_DOES_NOT_EXISTS);

    // Only allow updating price/limits
    if (plan.name.toLowerCase() === 'pro') {
      // Pro: price must be highest, limits must be -1
      if (data.maxLogsPerMonth !== undefined && data.maxLogsPerMonth !== -1) throw new ResourceLimitExceededError(HttpResponse.PRO_PLAN_UNLIMITED_LOGS);
      if (data.maxArticlesPerMonth !== undefined && data.maxArticlesPerMonth !== -1) throw new ResourceLimitExceededError(HttpResponse.PRO_PLAN_UNLIMITED_ARTICLES);
      if (data.price !== undefined && (data.price <= plus.price || data.price <= base.price)) throw new ResourceLimitExceededError(HttpResponse.PRO_PLAN_PRICE_HIGHEST);
    } else if (plan.name.toLowerCase() === 'plus') {
      // Plus: price > base, limits > base
      if (data.price !== undefined && (data.price <= base.price || data.price >= pro.price)) throw new ResourceLimitExceededError(HttpResponse.PLUS_PLAN_PRICE_BETWEEN);
      if (data.maxLogsPerMonth !== undefined && (data.maxLogsPerMonth <= base.maxLogsPerMonth)) throw new ResourceLimitExceededError(HttpResponse.PLUS_PLAN_LOGS_GT_BASE);
      if (data.maxArticlesPerMonth !== undefined && (data.maxArticlesPerMonth <= base.maxArticlesPerMonth)) throw new ResourceLimitExceededError(HttpResponse.PLUS_PLAN_ARTICLES_GT_BASE);
    } else if (plan.name.toLowerCase() === 'base') {
      // Base: price must be lowest, limits lowest
      if (data.price !== undefined && (data.price >= plus.price || data.price >= pro.price)) throw new ResourceLimitExceededError(HttpResponse.BASE_PLAN_PRICE_LOWEST);
      if (data.maxLogsPerMonth !== undefined && (data.maxLogsPerMonth >= plus.maxLogsPerMonth)) throw new ResourceLimitExceededError(HttpResponse.BASE_PLAN_LOGS_LT_PLUS);
      if (data.maxArticlesPerMonth !== undefined && (data.maxArticlesPerMonth >= plus.maxArticlesPerMonth)) throw new ResourceLimitExceededError(HttpResponse.BASE_PLAN_ARTICLES_LT_PLUS);
    }
    return this.subscriptionRepository.update(id, data);
  }
} 