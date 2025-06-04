import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@axios';
import axios from 'axios';

interface ReportState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ReportState = {
  loading: false,
  error: null,
  success: false,
};

export const createReport = createAsyncThunk(
  'report/create',
  async (reportData: { targetType: 'article' | 'user'; targetId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/reports', reportData);
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

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReportState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createReport.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to create report';
        state.success = false;
      });
  },
});

export const { clearReportState } = reportSlice.actions;

export default reportSlice.reducer; 