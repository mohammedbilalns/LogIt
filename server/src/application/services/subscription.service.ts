import { ISubscriptionService } from "../../domain/services/subsription.service.interface";
import { ISubscriptionRepository } from "../../domain/repositories/subscription.repository.interface";
import { IUserSubscriptionRepository } from "../../domain/repositories/user-subscription.repository.interface";
import { SubscriptionPlan } from "../../domain/entities/subscription.entity";
import {
  ResourceLimitExceededError,
} from "../errors/resource.errors";
import { HttpResponse } from "../../constants/responseMessages";
import { CreateSubscriptionData, UpdateSubscriptionData } from "../dtos";

export class SubscriptionService implements ISubscriptionService {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private userSubscriptionRepository: IUserSubscriptionRepository
  ) {}

  async fetchSubscriptions(): Promise<SubscriptionPlan[]> {
    const { data } = await this.subscriptionRepository.findAll();
    return data;
  }

  async createSubscription(
    data: CreateSubscriptionData
  ): Promise<SubscriptionPlan> {
    const existingByName = await this.subscriptionRepository.findByName(data.name);
    if (existingByName) {
      throw new ResourceLimitExceededError(HttpResponse.SUBSCRIPTION_NAME_EXISTS);
    }

    const existingByDetails = await this.subscriptionRepository.findByDetails(
      data.price,
      data.maxLogsPerMonth,
      data.maxArticlesPerMonth
    );
    if (existingByDetails) {
      throw new ResourceLimitExceededError(HttpResponse.SUBSCRIPTION_DETAILS_EXISTS);
    }

    const subscription = await this.subscriptionRepository.create(data);
    return subscription;
  }

  async deActivateSubscription(id: string): Promise<SubscriptionPlan | null> {
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      return null;
    }

    // Check if there are active users subscribed to this plan
    const activeSubscriptions = await this.userSubscriptionRepository.findActiveSubscriptionsByPlanId(id);
    if (activeSubscriptions.length > 0) {
      throw new ResourceLimitExceededError(HttpResponse.SUBSCRIPTION_HAS_ACTIVE_USERS);
    }

    const updatedSubscription = await this.subscriptionRepository.update(id, {
      isActive: false,
    });
    return updatedSubscription;
  }

  async updateSubscription(
    id: string,
    data: UpdateSubscriptionData
  ): Promise<SubscriptionPlan | null> {
    const plan = await this.subscriptionRepository.findById(id);
    if (!plan) return null;

    // Check if there are active users subscribed to this plan
    const activeSubscriptions = await this.userSubscriptionRepository.findActiveSubscriptionsByPlanId(id);
    if (activeSubscriptions.length > 0) {
      throw new ResourceLimitExceededError(HttpResponse.SUBSCRIPTION_HAS_ACTIVE_USERS);
    }

    if (data.name && data.name !== plan.name) {
      const existingByName = await this.subscriptionRepository.findByName(data.name);
      if (existingByName) {
        throw new ResourceLimitExceededError(HttpResponse.SUBSCRIPTION_NAME_EXISTS);
      }
    }

    if (data.price !== undefined || data.maxLogsPerMonth !== undefined || data.maxArticlesPerMonth !== undefined) {
      const checkPrice = data.price !== undefined ? data.price : plan.price;
      const checkMaxLogs = data.maxLogsPerMonth !== undefined ? data.maxLogsPerMonth : plan.maxLogsPerMonth;
      const checkMaxArticles = data.maxArticlesPerMonth !== undefined ? data.maxArticlesPerMonth : plan.maxArticlesPerMonth;
      
      const existingByDetails = await this.subscriptionRepository.findByDetails(
        checkPrice,
        checkMaxLogs,
        checkMaxArticles
      );
      if (existingByDetails && existingByDetails.id !== id) {
        throw new ResourceLimitExceededError(HttpResponse.SUBSCRIPTION_DETAILS_EXISTS);
      }
    }

    return this.subscriptionRepository.update(id, data);
  }
}
