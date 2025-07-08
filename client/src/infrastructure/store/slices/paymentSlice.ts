import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createPaymentOrder as createPaymentOrderUsecase } from '@/domain/usecases/payment/createPaymentOrder';
import { verifyPaymentAndSubscribe as verifyPaymentAndSubscribeUsecase } from '@/domain/usecases/payment/verifyPaymentAndSubscribe';

interface PaymentState {
  loading: boolean;
  error: string | null;
  order: any | null;
  verification: any | null;
}

const initialState: PaymentState = {
  loading: false,
  error: null,
  order: null,
  verification: null,
};

export const createPaymentOrder = createAsyncThunk(
  'payment/createOrder',
  async (
    { amount, currency, receipt }: { amount: number; currency: string; receipt: string },
    { rejectWithValue }
  ) => {
    try {
      return await createPaymentOrderUsecase({ amount, currency, receipt });
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create payment order');
    }
  }
);

export const verifyPaymentAndSubscribe = createAsyncThunk(
  'payment/verify',
  async (
    data: {
      orderId: string;
      paymentId: string;
      signature: string;
      userId: string;
      planId: string;
      amount: number;
      expiryDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await verifyPaymentAndSubscribeUsecase(data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to verify payment');
    }
  }
);

export const startRazorpayPayment = createAsyncThunk(
  'payment/startRazorpayPayment',
  async (
    { plan, user }: { plan: any; user: any },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // 1. Create order
      const orderRes = await dispatch(
        createPaymentOrder({
          amount: plan.price * 100,
          currency: 'INR',
          receipt: `rcpt_${plan.id.slice(0, 8)}_${Date.now()}`,
        })
      ).unwrap();

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderRes.amount,
          currency: orderRes.currency,
          name: 'LogIt',
          description: `Upgrade to ${plan.name}`,
          image: '/logo-light.png',
          order_id: orderRes.id,
          handler: async function (response: any) {
            try {
              const expiryDate = new Date();
              expiryDate.setMonth(expiryDate.getMonth() + 1);
              const verifyRes = await dispatch(
                verifyPaymentAndSubscribe({
                  orderId: orderRes.id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  userId: user._id,
                  planId: plan.id,
                  amount: plan.price,
                  expiryDate: expiryDate.toISOString(),
                })
              ).unwrap();
              resolve(verifyRes);
            } catch (err) {
              reject('Could not verify payment.');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: { color: '#1971C2' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (err: any) {
      return rejectWithValue(err.message || 'Could not initiate payment.');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyPaymentAndSubscribe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPaymentAndSubscribe.fulfilled, (state, action) => {
        state.loading = false;
        state.verification = action.payload;
      })
      .addCase(verifyPaymentAndSubscribe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default paymentSlice.reducer; 