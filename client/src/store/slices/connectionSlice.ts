import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axios';
import { API_ROUTES } from '@/constants/routes';

interface ConnectionState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ConnectionState = {
  loading: false,
  error: null,
  success: false,
};

export const followUser = createAsyncThunk(
  'connection/follow',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.CONNECTIONS.FOLLOW, { targetUserId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'connection/unfollow',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.CONNECTIONS.UNFOLLOW, { targetUserId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
    }
  }
);

export const blockUser = createAsyncThunk(
  'connection/block',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.CONNECTIONS.BLOCK, { targetUserId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block user');
    }
  }
);

export const unblockUser = createAsyncThunk(
  'connection/unblock',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.CONNECTIONS.UNBLOCK, { targetUserId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unblock user');
    }
  }
);

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    clearConnectionState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(followUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(followUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(unfollowUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(unfollowUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(blockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(blockUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(unblockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(unblockUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearConnectionState } = connectionSlice.actions;
export default connectionSlice.reducer; 