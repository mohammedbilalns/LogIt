import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@axios';
import { API_ROUTES } from '@/constants/routes';
import axios from 'axios';
import { TagManagementState } from '@type/tag.types';

const initialState: TagManagementState = {
  tags: [],
  promotedTags: [],
  loadingAllTags: false,
  errorAllTags: null,
  loadingPromotedTags: false,
  errorPromotedTags: null,
  total: 0,
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
};

export const fetchTagsForManagement = createAsyncThunk(
  'tagManagement/fetchAll',
  async ({ page, limit, search, promoted, sortBy, sortOrder }: {
    page?: number;
    limit?: number;
    search?: string;
    promoted?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (promoted !== undefined) params.append('promoted', promoted.toString());
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const response = await axiosInstance.get(`${API_ROUTES.TAGS.BASE}?${params.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch tags');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const promoteTagInManagement = createAsyncThunk(
  'tagManagement/promote',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.TAGS.PROMOTE(id));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to promote tag');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const demoteTagInManagement = createAsyncThunk(
  'tagManagement/demote',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.TAGS.DEMOTE(id));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to demote tag');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const tagManagementSlice = createSlice({
  name: 'tagManagement',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
    },
    clearErrors: (state) => {
      state.errorAllTags = null;
      state.errorPromotedTags = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tags for Management
      .addCase(fetchTagsForManagement.pending, (state, action) => {
        if (action.meta.arg.promoted) {
          state.loadingPromotedTags = true;
          state.errorPromotedTags = null;
        } else {
          state.loadingAllTags = true;
          state.errorAllTags = null;
        }
      })
      .addCase(fetchTagsForManagement.fulfilled, (state, action) => {
        if (action.meta.arg.promoted) {
          state.loadingPromotedTags = false;
          state.promotedTags = action.payload.tags;
        } else {
          state.loadingAllTags = false;
          state.tags = action.payload.tags;
          state.total = action.payload.total;
        }
      })
      .addCase(fetchTagsForManagement.rejected, (state, action) => {
        if (action.meta.arg.promoted) {
          state.loadingPromotedTags = false;
          state.errorPromotedTags = action.payload as string || 'Failed to fetch promoted tags';
        } else {
          state.loadingAllTags = false;
          state.errorAllTags = action.payload as string || 'Failed to fetch all tags';
        }
      })
      // Promote Tag in Management
      .addCase(promoteTagInManagement.pending, (state) => {
        state.loadingAllTags = true;
        state.errorAllTags = null;
      })
      .addCase(promoteTagInManagement.fulfilled, (state, action) => {
        state.loadingAllTags = false;
        // Update tag in both arrays
        const updatedTag = action.payload;
        const tagIndex = state.tags.findIndex(tag => tag._id === updatedTag._id);
        if (tagIndex !== -1) {
          state.tags[tagIndex] = updatedTag;
        }
        const promotedIndex = state.promotedTags.findIndex(tag => tag._id === updatedTag._id);
        if (promotedIndex !== -1) {
          state.promotedTags[promotedIndex] = updatedTag;
        }
      })
      .addCase(promoteTagInManagement.rejected, (state, action) => {
        state.loadingAllTags = false;
        state.errorAllTags = action.payload as string || 'Failed to promote tag';
      })
      // Demote Tag in Management
      .addCase(demoteTagInManagement.pending, (state) => {
        state.loadingAllTags = true;
        state.errorAllTags = null;
      })
      .addCase(demoteTagInManagement.fulfilled, (state, action) => {
        state.loadingAllTags = false;
        // Update tag in both arrays
        const updatedTag = action.payload;
        const tagIndex = state.tags.findIndex(tag => tag._id === updatedTag._id);
        if (tagIndex !== -1) {
          state.tags[tagIndex] = updatedTag;
        }
        const promotedIndex = state.promotedTags.findIndex(tag => tag._id === updatedTag._id);
        if (promotedIndex !== -1) {
          state.promotedTags[promotedIndex] = updatedTag;
        }
      })
      .addCase(demoteTagInManagement.rejected, (state, action) => {
        state.loadingAllTags = false;
        state.errorAllTags = action.payload as string || 'Failed to demote tag';
      });
  },
});

export const { setSearchQuery, setPage, setPageSize, clearErrors } = tagManagementSlice.actions;
export default tagManagementSlice.reducer; 