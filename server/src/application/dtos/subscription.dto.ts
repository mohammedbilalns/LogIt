import { SubscriptionPlan } from "../../domain/entities/subscription.entity";

export interface CreateSubscriptionData {
  name: string;
  description: string;
  isActive: boolean;
  price: number;
  maxLogsPerMonth: number;
  maxArticlesPerMonth: number;
}

export interface UpdateSubscriptionData {
  name?: string;
  description?: string;
  isActive?: boolean;
  price?: number;
  maxLogsPerMonth?: number;
  maxArticlesPerMonth?: number;
}

export interface GetSubscriptionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    isActive?: boolean;
    name?: string;
  };
}

export interface SubscriptionsResponse {
  subscriptions: SubscriptionPlan[];
  total: number;
}

export interface SubscriptionResponse extends SubscriptionPlan {} 