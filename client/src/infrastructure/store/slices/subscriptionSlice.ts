import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createSubscription as createSubscriptionUsecase } from '@/domain/usecases/subscription/createSubscription';
import { deactivateSubscription as deactivateSubscriptionUsecase } from '@/domain/usecases/subscription/deactivateSubscription';
import { fetchNextPlans as fetchNextPlansUsecase } from '@/domain/usecases/subscription/fetchNextPlans';
import { fetchSubscriptions as fetchSubscriptionsUsecase } from '@/domain/usecases/subscription/fetchSubscriptions';
import { updateSubscription as updateSubscriptionUsecase } from '@/domain/usecases/subscription/updateSubscription';
import { SubscriptionState } from '@/types/subscription.types';

export interface CreateSubscriptionData {
  name: string;
  description: string;
  isActive: boolean;
  price: number;
  maxLogsPerMonth: number;
  maxArticlesPerMonth: number;
}

export interface UpdateSubscriptionData {
  name?: string;
  description?: string;
  isActive?: boolean;
  price?: number;
  maxLogsPerMonth?: number;
  maxArticlesPerMonth?: number;
}

const initialState: SubscriptionState = {
  subscriptions: [],
  loading: false,
  error: null,
};

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchSubscriptionsUsecase();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch subscriptions');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscriptions/create',
  async (data: CreateSubscriptionData, { rejectWithValue }) => {
    try {
      return await createSubscriptionUsecase(data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscriptions/update',
  async (data: { id: string } & UpdateSubscriptionData, { rejectWithValue }) => {
    try {
      return await updateSubscriptionUsecase(data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update subscription');
    }
  }
);

export const deactivateSubscription = createAsyncThunk(
  'subscriptions/deactivate',
  async (id: string, { rejectWithValue }) => {
    try {
      return await deactivateSubscriptionUsecase(id);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to deactivate subscription');
    }
  }
);

export const fetchNextPlans = createAsyncThunk(
  'subscriptions/fetchNextPlans',
  async (
    { resource, currentLimit }: { resource: 'articles' | 'logs'; currentLimit: number },
    { rejectWithValue }
  ) => {
    try {
      return await fetchNextPlansUsecase({ resource, currentLimit });
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch upgrade plans');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.subscriptions.push(action.payload);
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const idx = state.subscriptions.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.subscriptions[idx] = action.payload;
      })
      .addCase(deactivateSubscription.fulfilled, (state, action) => {
        const idx = state.subscriptions.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.subscriptions[idx] = action.payload;
      });
  },
});

export default subscriptionSlice.reducer;
