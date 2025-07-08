import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Report, ReportState } from '@/types/report.types';
import { fetchReports as fetchReportsUsecase } from '@/domain/usecases/report/fetchReports';
import { updateReportStatus as updateReportStatusUsecase } from '@/domain/usecases/report/updateReportStatus';
import { blockArticle as blockArticleUsecase } from '@/domain/usecases/report/blockArticle';
import { createReport as createReportUsecase } from '@/domain/usecases/report/createReport';

const initialState: ReportState = {
  reports: [],
  loading: false,
  error: null,
  totalPages: 1,
  success: false,
};

export const fetchReports = createAsyncThunk(
  'report/fetchReports',
  async (
    { page = 1, limit = 10, search = '', status }: { page?: number; limit?: number; search?: string; status?: string },
    { rejectWithValue }
  ) => {
    try {
      return await fetchReportsUsecase({ page, limit, search, status });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reports');
    }
  }
);

export const updateReportStatus = createAsyncThunk(
  'report/updateStatus',
  async (
    { id, status }: { id: string; status: 'reviewed' | 'resolved' },
    { rejectWithValue }
  ) => {
    try {
      return await updateReportStatusUsecase({ id, status });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update report status');
    }
  }
);

export const blockArticle = createAsyncThunk(
  'report/blockArticle',
  async (articleId: string, { rejectWithValue }) => {
    try {
      return await blockArticleUsecase(articleId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to block article');
    }
  }
);

export const createReport = createAsyncThunk(
  'report/create',
  async (
    { targetType, targetId, reason }: { targetType: 'article' | 'user'; targetId: string; reason: string },
    { rejectWithValue }
  ) => {
    try {
      return await createReportUsecase({ targetType, targetId, reason });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create report');
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