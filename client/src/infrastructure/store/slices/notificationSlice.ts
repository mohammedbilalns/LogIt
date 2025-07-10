import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { notificationService } from '@/application/services/notificationService';
import { Notification } from '@/types/notification.types';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
  page: 1,
  limit: 10,
  total: 0,
  hasMore: true,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      return await notificationService.fetchNotifications(page, limit);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const loadMoreNotifications = createAsyncThunk(
  'notifications/loadMoreNotifications',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      return await notificationService.fetchNotifications(page, limit);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to load more notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.fetchUnreadCount();
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
    resetNotifications(state) {
      state.notifications = [];
      state.page = 1;
      state.hasMore = true;
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.total = action.payload.total;
        state.page = 1;
        state.hasMore = action.payload.notifications.length < action.payload.total;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadMoreNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMoreNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = [...state.notifications, ...action.payload.notifications];
        state.page += 1;
        state.hasMore = state.notifications.length < action.payload.total;
        state.total = action.payload.total;
      })
      .addCase(loadMoreNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((notif) =>
          notif.id === action.payload ? { ...notif, isRead: true } : notif
        );
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((notif) => ({ ...notif, isRead: true }));
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const { addNotification, setUnreadCount, resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
