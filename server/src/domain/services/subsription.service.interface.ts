import { SubscriptionPlan } from "../entities/subscription.entity";
import { CreateSubscriptionData, UpdateSubscriptionData } from "../../application/dtos";

export interface ISubscriptionService {
    createSubscription(data: CreateSubscriptionData): Promise<SubscriptionPlan>;
    fetchSubscriptions(): Promise<SubscriptionPlan[]>;
    updateSubscription(id: string, data: UpdateSubscriptionData): Promise<SubscriptionPlan | null>;
    deActivateSubscription(id: string): Promise<SubscriptionPlan | null>; 
}