import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/infrastructure/api/axios';
import { TagState} from "@type/tag.types"
import { API_ROUTES } from '@/constants/routes';
import axios from 'axios';
import { createTag as createTagUsecase } from '@/domain/usecases/tag/createTag';
import { fetchTags as fetchTagsUsecase } from '@/domain/usecases/tag/fetchTags';
import { updateTag as updateTagUsecase } from '@/domain/usecases/tag/updateTag';
import { deleteTag as deleteTagUsecase } from '@/domain/usecases/tag/deleteTag';
import { Tag } from '@type/tag.types';

const initialState: TagState = {
  tags: [],
  searchResults: [],
  tagNames: [],
  loading: false,
  error: null,
  total: 0,
  promotedTags: [],
  loadingAllTags: false,
  errorAllTags: null,
  loadingPromotedTags: false,
  errorPromotedTags: null,
};

export const createTag = createAsyncThunk(
  'tags/create',
  async (name: string, { rejectWithValue }) => {
    try {
      const tag = await createTagUsecase({ name });
      return tag;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create tag');
    }
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
  }, { rejectWithValue }) => {
    try {
      const filters = { search, promoted, sortBy, sortOrder, userId };
      const result = await fetchTagsUsecase(page, limit, filters);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tags');
    }
  }
);

export const fetchTagsByIds = createAsyncThunk(
  'tags/fetchByIds',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.TAGS.BY_IDS(ids));
      return response.data.tags; 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch tags');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const updateTag = createAsyncThunk(
  'tags/update',
  async ({ id, data }: { id: string; data: Partial<Tag> }, { rejectWithValue }) => {
    try {
      const tag = await updateTagUsecase(id, data);
      return tag;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update tag');
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tags/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteTagUsecase(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete tag');
    }
  }
);

export const promoteTag = createAsyncThunk(
  'tags/promote',
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

export const demoteTag = createAsyncThunk(
  'tags/demote',
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

const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
      state.errorAllTags = null;
      state.errorPromotedTags = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.error = action.payload as string || 'Failed to create tag';
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
        } else if (action.meta.arg.search) {
          state.loadingAllTags = false;
          state.searchResults = action.payload.tags;
        } else {
          state.loadingAllTags = false;
          state.tags = action.payload.tags;
          state.total = action.payload.total;
        }
      })
      .addCase(fetchTags.rejected, (state, action) => {
        if (action.meta.arg.promoted) {
          state.loadingPromotedTags = false;
          state.errorPromotedTags = action.payload as string || 'Failed to fetch promoted tags';
        } else {
          state.loadingAllTags = false;
          state.errorAllTags = action.payload as string || 'Failed to fetch all tags';
        }
      })
      // Fetch Tags by IDs
      .addCase(fetchTagsByIds.pending, (state) => {
        state.loadingAllTags = true;
        state.errorAllTags = null;
      })
      .addCase(fetchTagsByIds.fulfilled, (state, action) => {
        state.loadingAllTags = false;
        // Store tag names separately to avoid mixing with search results
        const existingIds = new Set(state.tagNames.map(tag => tag._id));
        const newTags = action.payload.filter((tag: any) => !existingIds.has(tag._id));
        state.tagNames = [...state.tagNames, ...newTags];
      })
      .addCase(fetchTagsByIds.rejected, (state, action) => {
        state.loadingAllTags = false;
        state.errorAllTags = action.payload as string || 'Failed to fetch tags';
      })
      // Update Tag
      .addCase(updateTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tags.findIndex(tag => tag._id === action.payload._id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        const searchIndex = state.searchResults.findIndex(tag => tag._id === action.payload._id);
        if (searchIndex !== -1) {
          state.searchResults[searchIndex] = action.payload;
        }
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update tag';
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
      .addCase(promoteTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(promoteTag.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tags.findIndex(tag => tag._id === action.payload._id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        const searchIndex = state.searchResults.findIndex(tag => tag._id === action.payload._id);
        if (searchIndex !== -1) {
          state.searchResults[searchIndex] = action.payload;
        }
      })
      .addCase(promoteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to promote tag';
      })
      // Demote Tag
      .addCase(demoteTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(demoteTag.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tags.findIndex(tag => tag._id === action.payload._id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        const searchIndex = state.searchResults.findIndex(tag => tag._id === action.payload._id);
        if (searchIndex !== -1) {
          state.searchResults[searchIndex] = action.payload;
        }
      })
      .addCase(demoteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to demote tag';
      });
  },
});

export const { clearSearchResults, clearError } = tagSlice.actions;
export default tagSlice.reducer; 