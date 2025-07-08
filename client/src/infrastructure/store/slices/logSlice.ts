import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createLog as createLogUsecase } from '@/domain/usecases/log/createLog';
import { deleteLog as deleteLogUsecase } from '@/domain/usecases/log/deleteLog';
import { fetchLog as fetchLogUsecase } from '@/domain/usecases/log/fetchLog';
import { fetchLogs as fetchLogsUsecase } from '@/domain/usecases/log/fetchLogs';
import { updateLog as updateLogUsecase } from '@/domain/usecases/log/updateLog';
import { LogState } from '@/types/log.types';

const initialState: LogState = {
  logs: [],
  loading: false,
  error: null,
  total: 0,
  searchQuery: '',
  currentLog: null,
  hasMore: true,
};

export const fetchLogs = createAsyncThunk(
  'logs/fetchAll',
  async (
    { page, limit, filters, sortBy, sortOrder }: { page: number; limit: number; filters?: string; sortBy?: string; sortOrder?: string },
    { rejectWithValue }
  ) => {
    try {
      return await fetchLogsUsecase(page, limit, filters, sortBy, sortOrder);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch logs');
    }
  }
);

export const fetchLog = createAsyncThunk(
  'logs/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      return await fetchLogUsecase(id);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch log');
    }
  }
);

export const createLog = createAsyncThunk(
  'logs/create',
  async (
    { title, content, tags }: { title: string; content: string; tags: string[] },
    { rejectWithValue }
  ) => {
    try {
      return await createLogUsecase(title, content, tags);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to create log');
    }
  }
);

export const updateLog = createAsyncThunk(
  'logs/update',
  async (
    {
      id,
      title,
      content,
      tags,
      mediaUrls,
    }: { id: string; title: string; content: string; tags: string[]; mediaUrls: string[] },
    { rejectWithValue }
  ) => {
    try {
      return await updateLogUsecase(id, title, content, tags, mediaUrls);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to update log');
    }
  }
);

export const deleteLog = createAsyncThunk(
  'logs/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteLogUsecase(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to delete log');
    }
  }
);

const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.logs = [];
    },
    resetState: (state) => {
      state.logs = [];
      state.loading = false;
      state.error = null;
      state.total = 0;
      state.searchQuery = '';
      state.currentLog = null;
    },
    clearCurrentLog: (state) => {
      state.currentLog = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg.page === 1) {
          state.logs = action.payload.logs;
        } else {
          state.logs = [...state.logs, ...action.payload.logs];
        }
        state.total = action.payload.total;
        state.hasMore = action.payload.logs.length === action.meta.arg.limit;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch logs';
      })
      .addCase(fetchLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLog.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLog = action.payload;
      })
      .addCase(fetchLog.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch log';
      })
      .addCase(createLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLog.fulfilled, (state, action) => {
        state.loading = false;
        state.logs.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createLog.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to create log';
      })
      .addCase(updateLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLog.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.logs.findIndex((log) => log._id === action.payload._id);
        if (index !== -1) {
          state.logs[index] = action.payload;
        }
        state.currentLog = action.payload;
      })
      .addCase(updateLog.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to update log';
      })
      .addCase(deleteLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLog.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = state.logs.filter((log) => log._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteLog.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to delete log';
      });
  },
});

export const { setSearchQuery, resetState, clearCurrentLog } = logSlice.actions;
export default logSlice.reducer;
