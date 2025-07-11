import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService, DashboardStatsResponse, DashboardChartRequest, DashboardChartResponse, DashboardChartType } from '@/application/services/dashboardService';
import { RootState } from '..';

interface DashboardState {
  stats: DashboardStatsResponse | null;
  chartData: {
    'user-joined': DashboardChartResponse | null;
    'article-shared': DashboardChartResponse | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  chartData: {
    'user-joined': null,
    'article-shared': null,
  },
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.fetchStats();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchDashboardChartData = createAsyncThunk(
  'dashboard/fetchChartData',
  async (params: DashboardChartRequest, { rejectWithValue }) => {
    try {
      return await dashboardService.fetchChartData(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch chart data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDashboardChartData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardChartData.fulfilled, (state, action) => {
        state.loading = false;
        const type = action.payload.type as DashboardChartType;
        state.chartData[type] = action.payload;
      })
      .addCase(fetchDashboardChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectDashboardStats = (state: RootState) => state.dashboard.stats;
export const selectUserJoinedChartData = (state: RootState) => state.dashboard.chartData['user-joined'];
export const selectArticleSharedChartData = (state: RootState) => state.dashboard.chartData['article-shared'];
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;

export default dashboardSlice.reducer; 