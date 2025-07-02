import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axios';
import { API_ROUTES } from '@/constants/routes';
import { ConnectionState } from '@/types/connection.types';


const initialState: ConnectionState = {
  loading: false,
  error: null,
  success: false,
  followers: [],
  following: [],
  followersLoading: false,
  followingLoading: false,
  followersError: null,
  followingError: null,
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

export const fetchFollowers = createAsyncThunk(
  'connection/fetchFollowers',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/connections/followers/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch followers');
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  'connection/fetchFollowing',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/connections/following/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch following');
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
      state.followers = [];
      state.following = [];
      state.followersLoading = false;
      state.followingLoading = false;
      state.followersError = null;
      state.followingError = null;
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
      })
      .addCase(fetchFollowers.pending, (state) => {
        state.followersLoading = true;
        state.followersError = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followersLoading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.followersLoading = false;
        state.followersError = action.payload as string;
      })
      .addCase(fetchFollowing.pending, (state) => {
        state.followingLoading = true;
        state.followingError = null;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.followingLoading = false;
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.followingLoading = false;
        state.followingError = action.payload as string;
      });
  },
});

export const { clearConnectionState } = connectionSlice.actions;
export default connectionSlice.reducer; 