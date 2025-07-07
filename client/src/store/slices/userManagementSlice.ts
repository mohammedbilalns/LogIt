import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import axiosInstance from '@axios';
import { API_ROUTES } from '@/constants/routes';
import { UserManagementState } from '@/types/user-management.types';
import axios from '@/api/axios';



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
  async ({ page, limit, search }: { page: number; limit: number; search: string }, { getState }) => {
    const state = getState() as RootState;
    const response = await axiosInstance.get(API_ROUTES.USER_MANAGEMENT.BASE, {
      params: {
        page,
        limit,
        search: search || state.userManagement.searchQuery,
      },
    });
    console.log("Fetched Users", response.data)
    return response.data;
  }
);

export const blockUser = createAsyncThunk(
  'userManagement/blockUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(API_ROUTES.USER_MANAGEMENT.BY_ID(id), { isBlocked: true });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block user');
    }
  }
);

export const unblockUser = createAsyncThunk(
  'userManagement/unblockUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(API_ROUTES.USER_MANAGEMENT.BY_ID(id), { isBlocked: false });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unblock user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'userManagement/updateProfile',
  async (profileData: {
    name: string;
    profession: string;
    bio: string;
    profileImage: string | null;
  }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ROUTES.USER_MANAGEMENT.UPDATE_PROFILE, profileData);
      dispatch({ type: 'auth/updateUser', payload: response.data });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'userManagement/changePassword',
  async (passwordData: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const response = await axiosInstance.put(API_ROUTES.AUTH.CHANGE_PASSWORD, passwordData);
    return response.data;
  }
);


export const fetchUsersPaginated = createAsyncThunk(
  'userManagement/fetchUsersPaginated',
  async (
    { page = 1, search = '' }: { page?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(`/user/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
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
      const res = await axios.get('/user/stats');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user stats');
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
        state.loading = false;
        state.users = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = Math.ceil(action.payload.total / action.meta.arg.limit);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(blockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false;
        const userIndex = state.users.findIndex(user => user._id === action.payload.id);
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
        const userIndex = state.users.findIndex(user => user._id === action.payload.id);
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
        state.error = action.payload as string || 'Failed to change password';
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

export const { setSearchQuery, resetState, clearError, clearUserManagementState, clearPaginatedUsers } = userManagementSlice.actions;
export default userManagementSlice.reducer; 