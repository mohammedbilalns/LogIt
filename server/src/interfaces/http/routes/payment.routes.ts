import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { RazorpayProvider } from '../../../application/providers/payment.provider';
import { PaymentServiceImpl } from '../../../application/services/payment.service';
import { PaymentController } from '../controllers/payment.controller';
import { UserSubscriptionRepository } from '../../../infrastructure/repositories/user-subscription.repository';

const router = Router();
const paymentProvider = new RazorpayProvider();
const paymentService = new PaymentServiceImpl(paymentProvider);
const userSubscriptionRepository = new UserSubscriptionRepository();
const controller = new PaymentController(paymentService, userSubscriptionRepository);

router.post('/order', asyncHandler((req, res) => controller.createOrder(req, res)));
router.post('/verify', asyncHandler((req, res) => controller.verifyPayment(req, res)));

export default router; 