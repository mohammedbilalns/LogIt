import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '@/api/axios';
import { SubscriptionPlan, SubscriptionState } from '@/types/subscription.types';

// DTOs matching the server
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
      const res = await axios.get('/subscription');
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscriptions/create',
  async (data: CreateSubscriptionData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/subscription', data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscriptions/update',
  async (data: { id: string } & UpdateSubscriptionData, { rejectWithValue }) => {
    try {
      const res = await axios.patch('/subscription', data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update subscription');
    }
  }
);

export const deactivateSubscription = createAsyncThunk(
  'subscriptions/deactivate',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/subscription/${id}/deactivate`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to deactivate subscription');
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  'subscriptions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete('/subscription', { data: { id } });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete subscription');
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
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.subscriptions = state.subscriptions.filter((s) => s.id !== action.payload);
      });
  },
});

export default subscriptionSlice.reducer;
