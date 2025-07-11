import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/infrastructure/store/slices/authSlice';
import userManagementReducer from '@/infrastructure/store/slices/userManagementSlice';
import articleReducer from '@/infrastructure/store/slices/articleSlice';
import tagReducer from '@/infrastructure/store/slices/tagSlice';
import tagManagementReducer from '@/infrastructure/store/slices/tagManagementSlice';
import uploadReducer from '@/infrastructure/store/slices/uploadSlice';
import uiReducer from '@/infrastructure/store/slices/uiSlice';
import initReducer from '@/infrastructure/store/slices/initSlice';
import logReducer from '@/infrastructure/store/slices/logSlice';
import reportReducer from '@/infrastructure/store/slices/reportSlice';
import homeReducer from '@/infrastructure/store/slices/homeSlice';
import connectionReducer from './slices/connectionSlice';
import chatReducer from './slices/chatSlice';
import callReducer from './slices/callSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import notificationReducer from './slices/notificationSlice';
import dashboardReducer from './slices/dashboardSlice';

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
    chat: chatReducer,
    calls: callReducer,
    subscriptions: subscriptionReducer,
    notifications: notificationReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 