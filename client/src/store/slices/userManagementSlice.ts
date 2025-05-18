import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import axiosInstance from '../../api/axios';

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  role: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  profession?: string;
}

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
            (newUser: User) => !state.users.some(existingUser => existingUser.id === newUser.id)
          );
          state.users = [...state.users, ...newUsers];
        }
        state.total = action.payload.total;
        state.hasMore = state.users.length < action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });
  },
});

export const { setSearchQuery, resetState } = userManagementSlice.actions;
export default userManagementSlice.reducer; 