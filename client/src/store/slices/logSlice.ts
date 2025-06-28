import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@axios';
import { RootState } from '@/store';
import axios from 'axios';
import { API_ROUTES } from '@/constants/routes';
import {Log, LogState} from '@/types/log.types'



const initialState: LogState = {
    logs: [],
    loading: false,
    error: null,
    total: 0,
    searchQuery: '',
    currentLog: null,
    hasMore: true,
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
            const response = await axiosInstance.get(API_ROUTES.LOGS.BASE, {
                params: {
                    page,
                    limit,
                    search: search || state.logs.searchQuery,
                    sortBy,
                    sortOrder,
                    filters
                },
            });
            return {
                logs: response.data.logs.map((log: Log) => ({
                    ...log,
                    tags: log.tags || [],
                    mediaUrls: log.mediaUrls || []
                })),
                total: response.data.total
            };
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || error.message);
            } else if (error instanceof Error) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('An unknown error occurred');
            }
        }
    }
);

export const fetchLog = createAsyncThunk(
    'logs/fetchOne',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(API_ROUTES.LOGS.BY_ID(id));
            return {
                ...response.data,
                tags: response.data.tags || [],
                mediaUrls: response.data.mediaUrls || []
            };
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || error.message);
            } else if (error instanceof Error) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('An unknown error occurred');
            }
        }
    }
);

export const createLog = createAsyncThunk(
    'logs/create',
    async (logData: { 
        title: string; 
        content: string; 
        tags: string[]; 
        mediaUrls: string[]; 
        createdAt: Date | null;
    }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_ROUTES.LOGS.BASE, {
                title: logData.title,
                content: logData.content,
                tags: logData.tags,
                mediaUrls: logData.mediaUrls,
                createdAt: logData.createdAt?.toISOString(),
            });
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data || error.message);
            } else if (error instanceof Error) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('An unknown error occurred');
            }
        }
    }
);

export const updateLog = createAsyncThunk(
    'logs/update',
    async ({ 
        id, 
        ...logData 
    }: { 
        id: string; 
        title: string; 
        content: string; 
        tags: string[]; 
        mediaUrls: string[]; 
        createdAt: Date | null;
    }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(API_ROUTES.LOGS.BY_ID(id), {
                title: logData.title,
                content: logData.content,
                tags: logData.tags,
                mediaUrls: logData.mediaUrls,
                createdAt: logData.createdAt?.toISOString(),
            });
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || error.message);
            } else if (error instanceof Error) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('An unknown error occurred');
            }
        }
    }
);

export const deleteLog = createAsyncThunk(
    'logs/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(API_ROUTES.LOGS.BY_ID(id));
            return id;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || error.message);
            } else if (error instanceof Error) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('An unknown error occurred');
            }
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
                state.total -= 1;
            })
            .addCase(deleteLog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || 'Failed to delete log';
            });
    },
});

export const { setSearchQuery, resetState, clearCurrentLog } = logSlice.actions;
export default logSlice.reducer; 