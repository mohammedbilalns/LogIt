
interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
}

interface User {
  _id: string;
  name?: string;
  email?: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export function openRazorpayCheckout({ order, plan, user, onSuccess }: {
  order: RazorpayOrder;
  plan: SubscriptionPlan;
  user: User;
  onSuccess?: (response: RazorpayResponse) => void | Promise<void>;
}) {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: 'LogIt',
    description: `Upgrade to ${plan.name}`,
    image: '/logo-light.png',
    order_id: order.id,
    handler: async function (response: RazorpayResponse) {
      if (onSuccess) await onSuccess(response);
    },
    prefill: {
      name: user?.name,
      email: user?.email,
    },
    theme: { color: '#1971C2' },
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
} 