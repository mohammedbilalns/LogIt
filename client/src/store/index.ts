import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@slices/authSlice';
import userManagementReducer from '@slices/userManagementSlice';
import articleReducer from '@slices/articleSlice';
import tagReducer from '@slices/tagSlice';
import tagManagementReducer from '@slices/tagManagementSlice';
import uploadReducer from '@slices/uploadSlice';
import uiReducer from '@slices/uiSlice';
import initReducer from '@slices/initSlice';
import logReducer from '@slices/logSlice';
import reportReducer from '@slices/reportSlice';
import homeReducer from '@slices/homeSlice';
import connectionReducer from './slices/connectionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userManagement: userManagementReducer,
    articles: articleReducer,
    tags: tagReducer,
    tagManagement: tagManagementReducer,
    upload: uploadReducer,
    ui: uiReducer,
    init: initReducer,
    logs: logReducer,
    report: reportReducer,
    home: homeReducer,
    connection: connectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 