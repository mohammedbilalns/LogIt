import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import axiosInstance from '@axios';
import { User } from '@type/user.types';

interface UserManagementState {
  users: User[];
  total: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  searchQuery: string;
}

const initialState: UserManagementState = {
  users: [],
  total: 0,
  loading: false,
  error: null,
  hasMore: true,
  searchQuery: '',
};

export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async ({ page, limit, search }: { page: number; limit: number; search: string }, { getState }) => {
    const state = getState() as RootState;
    const response = await axiosInstance.get('/admin/users', {
      params: {
        page,
        limit,
        search: search || state.userManagement.searchQuery,
      },
    });
    return response.data;
  }
);

export const blockUser = createAsyncThunk(
  'userManagement/blockUser',
  async (id: string) => {
    const response = await axiosInstance.patch(`/admin/users/${id}`, { isBlocked: true });
    return response.data;
  }
);

export const unblockUser = createAsyncThunk(
  'userManagement/unblockUser',
  async (id: string) => {
    const response = await axiosInstance.patch(`/admin/users/${id}`, { isBlocked: false });
    return response.data;
  }
);

export const updateProfile = createAsyncThunk(
  'userManagement/updateProfile',
  async (profileData: {
    name?: string;
    profileImage?: string;
    profession?: string;
    bio?: string;
  }) => {
    const response = await axiosInstance.put('/user/update-profile', profileData);
    return response.data;
  }
);

export const changePassword = createAsyncThunk(
  'userManagement/changePassword',
  async (passwordData: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const response = await axiosInstance.put('/user/change-password', passwordData);
    return response.data;
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.users = [];
      state.hasMore = true;
    },
    resetState: (state) => {
      state.users = [];
      state.total = 0;
      state.loading = false;
      state.error = null;
      state.hasMore = true;
      state.searchQuery = '';
    },
    clearError: (state) => {
      state.error = null;
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
        if (action.meta.arg.page === 1) {
          state.users = action.payload.users;
        } else {
          const newUsers = action.payload.users.filter(
            (newUser: User) => !state.users.some(existingUser => existingUser._id === newUser._id)
          );
          state.users = [...state.users, ...newUsers];
        }
        state.total = action.payload.total;
        state.hasMore = state.users.length < action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        const userIndex = state.users.findIndex(user => user._id === action.payload.id);
        if (userIndex !== -1) {
          state.users[userIndex] = { ...state.users[userIndex], isBlocked: true };
        }
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        const userIndex = state.users.findIndex(user => user._id === action.payload.id);
        if (userIndex !== -1) {
          state.users[userIndex] = { ...state.users[userIndex], isBlocked: false };
        }
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update profile';
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
        state.error = action.error.message || 'Failed to change password';
      });
  },
});

export const { setSearchQuery, resetState, clearError } = userManagementSlice.actions;
export default userManagementSlice.reducer; 