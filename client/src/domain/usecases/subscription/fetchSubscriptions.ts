import { subscriptionService } from '@/application/services/subscriptionService';
import { SubscriptionPlan } from '@/types/subscription.types';

export async function fetchSubscriptions(): Promise<SubscriptionPlan[]> {
  return await subscriptionService.fetchSubscriptions();
} 