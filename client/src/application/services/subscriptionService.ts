import axiosInstance from '@/infrastructure/api/axios';
import { CreateSubscriptionData, UpdateSubscriptionData } from '@/infrastructure/store/slices/subscriptionSlice';
import { API_ROUTES } from '@/constants/routes';

const SUBSCRIPTION_BASE = '/subscription';

export const subscriptionService = {
  async fetchSubscriptions() {
    const res = await axiosInstance.get(SUBSCRIPTION_BASE);
    return res.data.data;
  },
  async createSubscription(data: CreateSubscriptionData) {
    const res = await axiosInstance.post(SUBSCRIPTION_BASE, data);
    return res.data.data;
  },
  async updateSubscription(data: { id: string } & UpdateSubscriptionData) {
    const res = await axiosInstance.patch(SUBSCRIPTION_BASE, data);
    return res.data.data;
  },
  async deactivateSubscription(id: string) {
    const res = await axiosInstance.patch(`${SUBSCRIPTION_BASE}/${id}/deactivate`);
    return res.data.data;
  },
  async fetchNextPlans({ resource, currentLimit }: { resource: 'articles' | 'logs'; currentLimit: number }) {
    const res = await axiosInstance.get(`${SUBSCRIPTION_BASE}/next-plans?resource=${resource}&currentLimit=${currentLimit}`);
    return res.data;
  },
}; 