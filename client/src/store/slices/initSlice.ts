import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@axios';
import { checkAuth } from './authSlice';

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
      await api.get('/auth/csrf');
      // Then check authentication
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
        state.isInitialized = true; // Still set to true to allow app to render
        state.error = action.payload as string;
      });
  },
});

export const { resetInitState } = initSlice.actions;
export default initSlice.reducer; 