export interface PaymentService {
  createOrder(
    amount: number,
    currency: string,
    receipt: string
  ): Promise<{
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  }>;
  verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean>;
}
