import { paymentService } from '@/application/services/paymentService';

export async function createPaymentOrder({ amount, currency, receipt }: { amount: number; currency: string; receipt: string }) {
  return await paymentService.createPaymentOrder({ amount, currency, receipt });
} 