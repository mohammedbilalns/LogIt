import { subscriptionService } from '@/application/services/subscriptionService';

export async function fetchNextPlans({ resource, currentLimit }: { resource: 'articles' | 'logs'; currentLimit: number }) {
  return await subscriptionService.fetchNextPlans({ resource, currentLimit });
} 