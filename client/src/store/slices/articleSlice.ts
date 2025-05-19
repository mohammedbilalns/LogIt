import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

interface Article {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  featured_image?: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticleState {
  articles: Article[];
  currentArticle: Article | null;
  loading: boolean;
  error: string | null;
}

const initialState: ArticleState = {
  articles: [],
  currentArticle: null,
  loading: false,
  error: null,
};

// Async thunks
export const createArticle = createAsyncThunk(
  'articles/create',
  async (articleData: { 
    title: string; 
    content: string; 
    tagIds: string[]; 
    featured_image?: string;
  }) => {
    const response = await axiosInstance.post('/articles', articleData);
    return response.data;
  }
);

export const updateArticle = createAsyncThunk(
  'articles/update',
  async ({ id, articleData }: { 
    id: string; 
    articleData: { 
      title: string; 
      content: string; 
      tagIds: string[]; 
      featured_image?: string;
    }; 
  }) => {
    const response = await axiosInstance.put(`/articles/${id}`, articleData);
    return response.data;
  }
);

export const fetchArticles = createAsyncThunk(
  'articles/fetchAll',
  async () => {
    const response = await axiosInstance.get('/articles');
    return response.data.articles;
  }
);

export const fetchArticle = createAsyncThunk(
  'articles/fetchOne',
  async (id: string) => {
    const response = await axiosInstance.get(`/articles/${id}`);
    return response.data;
  }
);

export const deleteArticle = createAsyncThunk(
  'articles/delete',
  async (id: string) => {
    await axiosInstance.delete(`/articles/${id}`);
    return id;
  }
);

const articleSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Article
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.articles.push(action.payload);
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create article';
      })
      // Update Article
      .addCase(updateArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.articles.findIndex(article => article._id === action.payload._id);
        if (index !== -1) {
          state.articles[index] = action.payload;
        }
        if (state.currentArticle?._id === action.payload._id) {
          state.currentArticle = action.payload;
        }
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update article';
      })
      // Fetch All Articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch articles';
      })
      // Fetch Single Article
      .addCase(fetchArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentArticle = action.payload;
      })
      .addCase(fetchArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch article';
      })
      // Delete Article
      .addCase(deleteArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = state.articles.filter(article => article._id !== action.payload);
        if (state.currentArticle?._id === action.payload) {
          state.currentArticle = null;
        }
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete article';
      });
  },
});

export const { clearCurrentArticle } = articleSlice.actions;
export default articleSlice.reducer; 