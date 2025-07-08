import axiosInstance from '@/infrastructure/api/axios';
import { API_ROUTES } from '@/constants/routes';

export const paymentService = {
  async createPaymentOrder({ amount, currency, receipt }: { amount: number; currency: string; receipt: string }) {
    const res = await axiosInstance.post(API_ROUTES.PAYMENTS.ORDER, { amount, currency, receipt });
    return res.data;
  },
  async verifyPaymentAndSubscribe(data: {
    orderId: string;
    paymentId: string;
    signature: string;
    userId: string;
    planId: string;
    amount: number;
    expiryDate: string;
  }) {
    const res = await axiosInstance.post(API_ROUTES.PAYMENTS.VERIFY, data);
    return res.data;
  },
}; 