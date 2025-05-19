import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

interface Tag {
  _id: string;
  name: string;
  usageCount: number;
  promoted: boolean;
}

interface TagState {
  tags: Tag[];
  searchResults: Tag[];
  loading: boolean;
  error: string | null;
}

const initialState: TagState = {
  tags: [],
  searchResults: [],
  loading: false,
  error: null,
};

export const searchTags = createAsyncThunk(
  'tags/search',
  async (query: string) => {
    const response = await axiosInstance.get(`/tags/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
);

export const createTag = createAsyncThunk(
  'tags/create',
  async (name: string) => {
    const response = await axiosInstance.post('/tags', { name });
    return response.data;
  }
);

export const fetchTags = createAsyncThunk(
  'tags/fetchAll',
  async () => {
    const response = await axiosInstance.get('/tags');
    return response.data.tags;
  }
);

export const deleteTag = createAsyncThunk(
  'tags/delete',
  async (id: string) => {
    await axiosInstance.delete(`/tags/${id}`);
    return id;
  }
);

export const promoteTag = createAsyncThunk(
  'tags/promote',
  async (id: string) => {
    const response = await axiosInstance.post(`/tags/${id}/promote`);
    return response.data;
  }
);

export const demoteTag = createAsyncThunk(
  'tags/demote',
  async (id: string) => {
    const response = await axiosInstance.post(`/tags/${id}/demote`);
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
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tags';
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
      })
      // Demote Tag
      .addCase(demoteTag.fulfilled, (state, action) => {
        const index = state.tags.findIndex(tag => tag._id === action.payload._id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
      });
  },
});

export const { clearSearchResults } = tagSlice.actions;
export default tagSlice.reducer; 