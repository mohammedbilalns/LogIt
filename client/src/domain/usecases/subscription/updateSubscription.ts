import { subscriptionService } from '@/application/services/subscriptionService';
import { UpdateSubscriptionData } from '@/infrastructure/store/slices/subscriptionSlice';
import { SubscriptionPlan } from '@/types/subscription.types';

export async function updateSubscription(data: { id: string } & UpdateSubscriptionData): Promise<SubscriptionPlan> {
  return await subscriptionService.updateSubscription(data);
} 