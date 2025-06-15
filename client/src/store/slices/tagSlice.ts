import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@axios';
import { TagState} from "@type/tag.types"
import { API_ROUTES } from '@/constants/routes';




const initialState: TagState = {
  tags: [],
  searchResults: [],
  loading: false,
  error: null,
  total: 0,
  promotedTags: [],
  loadingAllTags: false,
  errorAllTags: null,
  loadingPromotedTags: false,
  errorPromotedTags: null,
};

export const searchTags = createAsyncThunk(
  'tags/search',
  async (query: string) => {
    const response = await axiosInstance.get(`${API_ROUTES.TAGS.BASE}/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
);

export const createTag = createAsyncThunk(
  'tags/create',
  async (name: string) => {
    const response = await axiosInstance.post(API_ROUTES.TAGS.BASE, { name });
    return response.data;
  }
);

export const fetchTags = createAsyncThunk(
  'tags/fetchAll',
  async ({ page, limit, search, promoted, sortBy, sortOrder, userId }: {
    page?: number;
    limit?: number;
    search?: string;
    promoted?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
  }) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    params.append('search', search || '');
    if (promoted !== undefined) params.append('promoted', promoted.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (userId) params.append('userId', userId);

    const response = await axiosInstance.get(`${API_ROUTES.TAGS.BASE}?${params.toString()}`);
    return response.data;
  }
);

export const deleteTag = createAsyncThunk(
  'tags/delete',
  async (id: string) => {
    await axiosInstance.delete(API_ROUTES.TAGS.BY_ID(id));
    return id;
  }
);

export const promoteTag = createAsyncThunk(
  'tags/promote',
  async (id: string) => {
    const response = await axiosInstance.post(API_ROUTES.TAGS.PROMOTE(id));
    return response.data;
  }
);

export const demoteTag = createAsyncThunk(
  'tags/demote',
  async (id: string) => {
    const response = await axiosInstance.post(API_ROUTES.TAGS.DEMOTE(id));
    return response.data;
  }
);

export const fetchPromotedAndUserTags = createAsyncThunk(
  'tags/fetchPromotedAndUser',
  async ({ limit = 5 }: { limit?: number }) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const response = await axiosInstance.get(`${API_ROUTES.TAGS.BASE}/promoted-and-user?${params.toString()}`);
    return response.data;
  }
);

const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Tags
      .addCase(searchTags.pending, (state) => {
        state.loading = true; 
        state.error = null;
      })
      .addCase(searchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search tags';
      })
      // Create Tag
      .addCase(createTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags.push(action.payload);
        state.searchResults.push(action.payload);
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create tag';
      })
      // Fetch Tags
      .addCase(fetchTags.pending, (state, action) => {
        if (action.meta.arg.promoted) {
          state.loadingPromotedTags = true;
          state.errorPromotedTags = null;
        } else {
          state.loadingAllTags = true;
          state.errorAllTags = null;
        }
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        if (action.meta.arg.promoted) {
          state.loadingPromotedTags = false;
          state.promotedTags = action.payload.tags;
        } else {
          state.loadingAllTags = false;
          state.tags = action.payload.tags;
          state.total = action.payload.total;
        }
        console.log('fetchTags fulfilled - action.payload:', action.payload);
      })
      .addCase(fetchTags.rejected, (state, action) => {
        if (action.meta.arg.promoted) {
          state.loadingPromotedTags = false;
          state.errorPromotedTags = action.error.message || 'Failed to fetch promoted tags';
        } else {
          state.loadingAllTags = false;
          state.errorAllTags = action.error.message || 'Failed to fetch all tags';
        }
      })
      // Delete Tag
      .addCase(deleteTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = state.tags.filter(tag => tag._id !== action.payload);
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete tag';
      })
      // Promote Tag
      .addCase(promoteTag.fulfilled, (state, action) => {
        const index = state.tags.findIndex(tag => tag._id === action.payload._id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        //  update searchResults if the promoted tag is there
        const searchIndex = state.searchResults.findIndex(tag => tag._id === action.payload._id);
        if (searchIndex !== -1) {
          state.searchResults[searchIndex] = action.payload;
        }
      })
      // Demote Tag
      .addCase(demoteTag.fulfilled, (state, action) => {
        const index = state.tags.findIndex(tag => tag._id === action.payload._id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        //  update searchResults if the demoted tag is there
        const searchIndex = state.searchResults.findIndex(tag => tag._id === action.payload._id);
        if (searchIndex !== -1) {
          state.searchResults[searchIndex] = action.payload;
        }
      })
      // Fetch Promoted and User Tags
      .addCase(fetchPromotedAndUserTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotedAndUserTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload.tags;
        state.total = action.payload.total;
      })
      .addCase(fetchPromotedAndUserTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tags';
      });
  },
});

export const { clearSearchResults } = tagSlice.actions;
export default tagSlice.reducer; 