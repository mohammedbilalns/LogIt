import { PaymentProvider } from "../../domain/providers/payment.provider.interface";
import Razorpay from "razorpay";

export class RazorpayProvider implements PaymentProvider {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(amount: number, currency: string, receipt: string) {
    try {
      console.log("[RazorpayProvider] createOrder called with:", {
        amount,
        currency,
        receipt,
      });
      const order = await this.razorpay.orders.create({
        amount,
        currency,
        receipt,
      });
      console.log("[RazorpayProvider] Order created:", order);
      return {
        id: order.id,
        amount:
          typeof order.amount === "string"
            ? parseInt(order.amount, 10)
            : order.amount,
        currency: order.currency,
        receipt: order.receipt || "",
        status: String(order.status),
      };
    } catch (error) {
      console.error("[RazorpayProvider] Error in createOrder:", error);
      throw error;
    }
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    if (!orderId || !paymentId || !signature) return false;
    return true;
  }
}
