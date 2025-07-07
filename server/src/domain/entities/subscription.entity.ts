export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  price: number;
  maxLogsPerMonth: number;
  maxArticlesPerMonth: number;
}
