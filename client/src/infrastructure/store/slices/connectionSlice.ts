import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/constants/routes';
import { ConnectionState } from '@/types/connection.types';
import { followUser as followUserUsecase } from '@/domain/usecases/connection/followUser';
import { unfollowUser as unfollowUserUsecase } from '@/domain/usecases/connection/unfollowUser';
import { blockUser as blockUserUsecase } from '@/domain/usecases/connection/blockUser';
import { unblockUser as unblockUserUsecase } from '@/domain/usecases/connection/unblockUser';
import { fetchFollowers as fetchFollowersUsecase } from '@/domain/usecases/connection/fetchFollowers';
import { fetchFollowing as fetchFollowingUsecase } from '@/domain/usecases/connection/fetchFollowing';

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
      return await followUserUsecase(targetUserId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to follow user');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'connection/unfollow',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      return await unfollowUserUsecase(targetUserId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unfollow user');
    }
  }
);

export const blockUser = createAsyncThunk(
  'connection/block',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      return await blockUserUsecase(targetUserId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to block user');
    }
  }
);

export const unblockUser = createAsyncThunk(
  'connection/unblock',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      return await unblockUserUsecase(targetUserId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unblock user');
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  'connection/fetchFollowers',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await fetchFollowersUsecase(userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch followers');
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  'connection/fetchFollowing',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await fetchFollowingUsecase(userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch following');
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