import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/infrastructure/api/axios';
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
      const csrfPromise = api.get(API_ROUTES.AUTH.CSRF);
      const checkAuthPromise = dispatch(checkAuth()).unwrap();
      await Promise.all([csrfPromise, checkAuthPromise]);
      return true;
    } catch (error: any) {
      console.log('App initialization completed (no valid session)');
      return true;
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