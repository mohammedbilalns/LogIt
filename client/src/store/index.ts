import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@slices/authSlice';
import userManagementReducer from '@slices/userManagementSlice';
import articleReducer from '@slices/articleSlice';
import tagReducer from '@slices/tagSlice';
import uploadReducer from '@slices/uploadSlice';
import uiReducer from '@slices/uiSlice';
import initReducer from '@slices/initSlice';
import logReducer from '@slices/logSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userManagement: userManagementReducer,
    articles: articleReducer,
    tags: tagReducer,
    upload: uploadReducer,
    ui: uiReducer,
    init: initReducer,
    logs: logReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 