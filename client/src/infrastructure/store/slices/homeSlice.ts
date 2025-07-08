import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchHomeData as fetchHomeDataUsecase } from '@/domain/usecases/home/fetchHomeData';
import { RootState } from '..';

interface HomeData {
  articlesCount: number;
  logsCount: number;
  messagesCount: number;
  followersCount: number;
  recentActivities: Array<{
    type: 'log' | 'article';
    id: string;
    title: string;
    createdAt: string;
  }>;
  chartData: Array<{
    date: string;
    logs: number;
    articles: number;
  }>;
}

interface HomeState {
  data: HomeData | null;
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchHomeData = createAsyncThunk(
  'home/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchHomeDataUsecase();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectHomeData = (state: RootState) => state.home.data;
export const selectHomeLoading = (state: RootState) => state.home.loading;
export const selectHomeError = (state: RootState) => state.home.error;

export default homeSlice.reducer; 