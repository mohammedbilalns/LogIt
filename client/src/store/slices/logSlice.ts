import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@axios';
import { RootState } from '@/store';

interface Log {
    _id: string;
    title: string;
    content: string;
    tags: string[]; // Assuming tags are stored as string IDs or names
    createdAt: string;
    media: string[]; // Add media property
}

interface LogState {
    logs: Log[];
    loading: boolean;
    error: string | null;
    total: number;
    searchQuery: string; // Add search query if needed, similar to articles
    currentLog: Log | null;
}

const initialState: LogState = {
    logs: [],
    loading: false,
    error: null,
    total: 0,
    searchQuery: '',
    currentLog: null,
};

// Async thunks
export const fetchLogs = createAsyncThunk(
    'logs/fetchAll',
    async ({ page, limit, search, sortBy, sortOrder, filters }: {
        page: number;
        limit: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        filters?: string;
    }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const response = await axiosInstance.get('/logs', {
                params: {
                    page,
                    limit,
                    search: search || state.logs.searchQuery,
                    sortBy,
                    sortOrder,
                    filters
                },
            });
            return response.data; // Assuming response has { logs: [...], total: N }
        } catch (error: any) {
             return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchLog = createAsyncThunk(
    'logs/fetchOne',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/logs/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createLog = createAsyncThunk(
    'logs/create',
    async (logData: { title: string; content: string; tags: string[]; mediaFiles: File[] | null; createdAt: Date | null }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('title', logData.title);
            formData.append('content', logData.content);
            if (logData.createdAt) {
              formData.append('createdAt', logData.createdAt.toISOString());
            }
            logData.tags.forEach(tag => formData.append('tags[]', tag));
            if (logData.mediaFiles) {
                logData.mediaFiles.forEach(file => formData.append('mediaFiles', file));
            }

            const response = await axiosInstance.post('/logs', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateLog = createAsyncThunk(
    'logs/update',
    async ({ id, ...logData }: { id: string; title: string; content: string; tags: string[]; mediaUrls: string[]; mediaFiles?: File[] | null; createdAt: Date | null }, { rejectWithValue }) => {
        try {
             const formData = new FormData();
             formData.append('title', logData.title);
             formData.append('content', logData.content);
             if (logData.createdAt) {
                formData.append('createdAt', logData.createdAt.toISOString());
             }
             logData.tags.forEach(tag => formData.append('tags[]', tag));

             logData.mediaUrls.forEach(url => formData.append('mediaUrls[]', url));
             if (logData.mediaFiles) {
                 logData.mediaFiles.forEach(file => formData.append('mediaFiles', file));
             }

             const response = await axiosInstance.put(`/logs/${id}`, formData, {
                 headers: {
                    'Content-Type': 'multipart/form-data',
                 },
             });
             return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteLog = createAsyncThunk(
    'logs/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/logs/${id}`);
            return id; // Return the deleted log's ID
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
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
                state.logs = action.payload.logs; 
                state.total = action.payload.total;
            })
            .addCase(fetchLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || 'Failed to fetch logs';
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
                state.error = action.payload as string || action.error.message || 'Failed to fetch log';
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
              state.error = action.payload as string || action.error.message || 'Failed to create log';
            })
             .addCase(updateLog.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(updateLog.fulfilled, (state, action) => {
              state.loading = false;
              const index = state.logs.findIndex(log => log._id === action.payload._id);
              if (index !== -1) {
                  state.logs[index] = action.payload;
              }
              state.currentLog = action.payload;
            })
            .addCase(updateLog.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload as string || action.error.message || 'Failed to update log';
            })
             .addCase(deleteLog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteLog.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = state.logs.filter(log => log._id !== action.payload);
                state.total -= 1; // Decrease total count
            })
            .addCase(deleteLog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || 'Failed to delete log';
            });
    },
});

export const { setSearchQuery, resetState, clearCurrentLog } = logSlice.actions;
export default logSlice.reducer; 