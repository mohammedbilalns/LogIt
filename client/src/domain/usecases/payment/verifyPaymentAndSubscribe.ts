import { paymentService } from '@/application/services/paymentService';

export async function verifyPaymentAndSubscribe(data: {
  orderId: string;
  paymentId: string;
  signature: string;
  userId: string;
  planId: string;
  amount: number;
  expiryDate: string;
}) {
  return await paymentService.verifyPaymentAndSubscribe(data);
} 