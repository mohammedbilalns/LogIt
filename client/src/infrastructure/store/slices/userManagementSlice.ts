import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ROUTES } from '@/constants/routes';
import { blockUser as blockUserUsecase } from '@/domain/usecases/userManagement/blockUser';
import { changePassword as changePasswordUsecase } from '@/domain/usecases/userManagement/changePassword';
import { fetchUsers as fetchUsersUsecase } from '@/domain/usecases/userManagement/fetchUsers';
import { fetchUserStats as fetchUserStatsUsecase } from '@/domain/usecases/userManagement/fetchUserStats';
import { unblockUser as unblockUserUsecase } from '@/domain/usecases/userManagement/unblockUser';
import { updateProfile as updateProfileUsecase } from '@/domain/usecases/userManagement/updateProfile';
import axiosInstance from '@/infrastructure/api/axios';
import axios from '@/infrastructure/api/axios';
import { RootState } from '@/infrastructure/store';
import { UserManagementState } from '@/types/user-management.types';

const initialState: UserManagementState = {
  users: [],
  total: 0,
  loading: false,
  error: null,
  searchQuery: '',
  totalPages: 0,
  success: false,
  paginatedUsers: [],
  paginatedUsersLoading: false,
  paginatedUsersHasMore: true,
  paginatedUsersPage: 1,
  paginatedUsersError: null,
};

export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async (
    { page, limit, search }: { page: number; limit: number; search: string },
    { getState }
  ) => {
    const state = getState() as RootState;
    const result = await fetchUsersUsecase(page, limit, search || state.userManagement.searchQuery);
    console.log('[fetchUsers thunk] result:', result);
    if (Array.isArray(result)) {
      return { users: result, total: result.length };
    }
    return result;
  }
);

export const blockUser = createAsyncThunk(
  'userManagement/blockUser',
  async (id: string, { rejectWithValue }) => {
    try {
      return await blockUserUsecase(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to block user');
    }
  }
);

export const unblockUser = createAsyncThunk(
  'userManagement/unblockUser',
  async (id: string, { rejectWithValue }) => {
    try {
      return await unblockUserUsecase(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unblock user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'userManagement/updateProfile',
  async (
    profileData: { name: string; profession: string; bio: string; profileImage: string | null },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const result = await updateProfileUsecase(profileData);
      dispatch({ type: 'auth/updateUser', payload: result });
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'userManagement/changePassword',
  async (passwordData: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      return await changePasswordUsecase(passwordData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

export const fetchUsersPaginated = createAsyncThunk(
  'userManagement/fetchUsersPaginated',
  async ({ page = 1, search = '' }: { page?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/user/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`
      );
      return {
        users: response.data.users,
        hasMore: response.data.hasMore,
        page,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchUserStatsUsecase();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch user stats');
    }
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.users = [];
      state.total = 0;
      state.totalPages = 0;
    },
    resetState: (state) => {
      state.users = [];
      state.total = 0;
      state.loading = false;
      state.error = null;
      state.searchQuery = '';
      state.totalPages = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUserManagementState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearPaginatedUsers(state) {
      state.paginatedUsers = [];
      state.paginatedUsersPage = 1;
      state.paginatedUsersHasMore = true;
      state.paginatedUsersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        console.log('[fetchUsers.fulfilled] payload:', action.payload);
        state.loading = false;
        state.users = action.payload?.users || [];
        state.total = action.payload?.total || 0;
        state.totalPages = Math.ceil((action.payload?.total || 0) / action.meta.arg.limit);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        console.log('[fetchUsers.rejected] error:', action.error, action.payload);
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(blockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false;
        const userIndex = state.users.findIndex((user) => user._id === action.payload.id);
        if (userIndex !== -1) {
          state.users[userIndex] = { ...state.users[userIndex], isBlocked: true };
        }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(unblockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.loading = false;
        const userIndex = state.users.findIndex((user) => user._id === action.payload.id);
        if (userIndex !== -1) {
          state.users[userIndex] = { ...state.users[userIndex], isBlocked: false };
        }
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to change password';
      })
      .addCase(fetchUsersPaginated.pending, (state) => {
        state.paginatedUsersLoading = true;
        state.paginatedUsersError = null;
      })
      .addCase(fetchUsersPaginated.fulfilled, (state, action) => {
        state.paginatedUsersLoading = false;
        if (action.payload.page === 1) {
          state.paginatedUsers = action.payload.users;
        } else {
          state.paginatedUsers = [...state.paginatedUsers, ...action.payload.users];
        }
        state.paginatedUsersHasMore = action.payload.hasMore;
        state.paginatedUsersPage = action.payload.page;
      })
      .addCase(fetchUsersPaginated.rejected, (state, action) => {
        state.paginatedUsersLoading = false;
        state.paginatedUsersError = action.payload as string;
      });
  },
});

export const {
  setSearchQuery,
  resetState,
  clearError,
  clearUserManagementState,
  clearPaginatedUsers,
} = userManagementSlice.actions;
export default userManagementSlice.reducer;
