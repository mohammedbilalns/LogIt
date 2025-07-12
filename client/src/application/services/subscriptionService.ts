import { API_ROUTES } from '@/constants/routes';
import axiosInstance from '@/infrastructure/api/axios';
import {
  CreateSubscriptionData,
  UpdateSubscriptionData,
} from '@/infrastructure/store/slices/subscriptionSlice';

export const subscriptionService = {
  async fetchSubscriptions() {
    const res = await axiosInstance.get(API_ROUTES.SUBSCRIPTION.BASE);
    return res.data.data;
  },
  async createSubscription(data: CreateSubscriptionData) {
    const res = await axiosInstance.post(API_ROUTES.SUBSCRIPTION.BASE, data);
    return res.data.data;
  },
  async updateSubscription(data: { id: string } & UpdateSubscriptionData) {
    const res = await axiosInstance.patch(API_ROUTES.SUBSCRIPTION.BASE, data);
    return res.data.data;
  },
  async deactivateSubscription(id: string) {
    const res = await axiosInstance.patch(API_ROUTES.SUBSCRIPTION.DEACTIVATE(id));
    return res.data.data;
  },
  async fetchNextPlans({
    resource,
    currentLimit,
  }: {
    resource: 'articles' | 'logs';
    currentLimit: number;
  }) {
    const res = await axiosInstance.get(API_ROUTES.SUBSCRIPTION.NEXT_PLANS(resource, currentLimit));
    return res.data;
  },
};
