import { PaymentService } from '../../domain/services/payment.service.interface';
import { PaymentProvider } from '../../domain/providers/payment.provider.interface';

export class PaymentServiceImpl implements PaymentService {
  constructor(private paymentProvider: PaymentProvider) {}

  async createOrder(amount: number, currency: string, receipt: string) {
    return this.paymentProvider.createOrder(amount, currency, receipt);
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    return this.paymentProvider.verifyPayment(orderId, paymentId, signature);
  }
} 