import { subscriptionService } from '@/application/services/subscriptionService';
import { SubscriptionPlan } from '@/types/subscription.types';

export async function deactivateSubscription(id: string): Promise<SubscriptionPlan> {
  return await subscriptionService.deactivateSubscription(id);
} 