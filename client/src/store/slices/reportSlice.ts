import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@axios';
import axios from 'axios';

export interface Report {
  id: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  targetType: 'article' | 'user';
  targetId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'blocked';
  createdAt: string;
  targetArticleTitle?: string;
}

interface ReportState {
  reports: Report[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  success: boolean;
}

const initialState: ReportState = {
  reports: [],
  loading: false,
  error: null,
  totalPages: 1,
  success: false,
};

// Async thunks
export const fetchReports = createAsyncThunk(
  'report/fetchReports',
  async ({ page = 1, limit = 10, search = '', status }: { page?: number; limit?: number; search?: string; status?: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && status !== 'all' && { status }),
      });

      const response = await axiosInstance.get(`/reports?${params.toString()}`);
      
      // Ensure the response has the expected structure
      if (!response.data || !Array.isArray(response.data.reports)) {
        throw new Error('Invalid response format from server');
      }

      return {
        reports: response.data.reports,
        totalPages: response.data.totalPages || Math.ceil(response.data.total / limit)
      };
    } catch (error: any) {
      console.error('Fetch reports error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch reports'
      );
    }
  }
);

export const updateReportStatus = createAsyncThunk(
  'report/updateStatus',
  async ({ id, status }: { id: string; status: 'reviewed' | 'resolved' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/reports/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update report status');
    }
  }
);

export const blockArticle = createAsyncThunk(
  'report/blockArticle',
  async (articleId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/reports/block-article/${articleId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block article');
    }
  }
);

export const createReport = createAsyncThunk(
  'report/create',
  async ({ targetType, targetId, reason }: { targetType: 'article' | 'user'; targetId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/reports', { targetType, targetId, reason });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create report');
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReportState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action: PayloadAction<{ reports: Report[]; totalPages: number }>) => {
        state.loading = false;
        state.reports = action.payload.reports;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Report Status
      .addCase(updateReportStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReportStatus.fulfilled, (state, action: PayloadAction<Report>) => {
        state.loading = false;
        const index = state.reports.findIndex(report => report.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Block Article
      .addCase(blockArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(blockArticle.fulfilled, (state, action) => {
        state.loading = false;
        // Update all reports for the blocked article
        const updatedReports = action.payload.reports;
        updatedReports.forEach((updatedReport: Report) => {
          const index = state.reports.findIndex(report => report.id === updatedReport.id);
          if (index !== -1) {
            state.reports[index] = updatedReport;
          }
        });
      })
      .addCase(blockArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Report
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createReport.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearError, clearReportState } = reportSlice.actions;
export default reportSlice.reducer; 