import { subscriptionService } from '@/application/services/subscriptionService';
import { CreateSubscriptionData } from '@/infrastructure/store/slices/subscriptionSlice';
import { SubscriptionPlan } from '@/types/subscription.types';

export async function createSubscription(data: CreateSubscriptionData): Promise<SubscriptionPlan> {
  return await subscriptionService.createSubscription(data);
} 