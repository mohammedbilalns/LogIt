import { Request, Response } from 'express';
import { PaymentService } from '../../../domain/services/payment.service.interface';
import { UserSubscriptionRepository } from '../../../infrastructure/repositories/user-subscription.repository';
import { HttpStatus } from '../../../constants/statusCodes';
import { HttpResponse } from '../../../constants/responseMessages';

export class PaymentController {
  constructor(private paymentService: PaymentService, private userSubscriptionRepository: UserSubscriptionRepository) {}

  async createOrder(req: Request, res: Response) {
    const { amount, currency, receipt } = req.body;
    console.log("Body from create order", req.body)
    if (!amount || !currency || !receipt) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: HttpResponse.MISSING_USER_DATA });
    }
    const order = await this.paymentService.createOrder(amount, currency, receipt);
    return res.json(order);
  }

  async verifyPayment(req: Request, res: Response) {
    const { orderId, paymentId, signature, userId, planId, amount, expiryDate } = req.body;
    if (!orderId || !paymentId || !signature || !userId || !planId || !amount || !expiryDate) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: HttpResponse.MISSING_USER_DATA });
    }
    const isValid = await this.paymentService.verifyPayment(orderId, paymentId, signature);
    if (!isValid) return res.status(HttpStatus.BAD_REQUEST).json({ valid: false, message: HttpResponse.INVALID_TOKEN });

    const userSubscription = await this.userSubscriptionRepository.createUserSubscription({
      userId,
      planId,
      amount,
      paymentId: orderId,
      expiryDate: new Date(expiryDate),
      isActive: true,
    });
    return res.json({ valid: true, userSubscription });
  }
} 