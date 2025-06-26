import { SubscriptionPlan } from "../entities/subscription.entity";

export interface ISubscriptionService {
    fetchSubscriptions(): Promise<SubscriptionPlan[]>;
    updateSubscription(id: string, data: Partial<Omit<SubscriptionPlan, 'id'>>): Promise<SubscriptionPlan | null>;
}