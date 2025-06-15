import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@axios';
import { checkAuth } from './authSlice';
import { API_ROUTES } from '@/constants/routes';

interface InitState {
  isInitialized: boolean;
  error: string | null;
}

const initialState: InitState = {
  isInitialized: false,
  error: null,
};

export const initializeApp = createAsyncThunk(
  'init/initialize',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await api.get(API_ROUTES.AUTH.CSRF);
      await dispatch(checkAuth());
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to initialize app';
      return rejectWithValue(message);
    }
  }
);

const initSlice = createSlice({
  name: 'init',
  initialState,
  reducers: {
    resetInitState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeApp.pending, (state) => {
        state.isInitialized = false;
        state.error = null;
      })
      .addCase(initializeApp.fulfilled, (state) => {
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.isInitialized = true; 
        state.error = action.payload as string;
      });
  },
});

export const { resetInitState } = initSlice.actions;
export default initSlice.reducer; 