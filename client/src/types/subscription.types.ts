export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  maxLogsPerMonth: number;
  maxArticlesPerMonth: number;
}

export interface SubscriptionState {
  subscriptions: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
}
