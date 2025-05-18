import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userManagementReducer from './slices/userManagementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userManagement: userManagementReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 