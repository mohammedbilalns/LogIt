import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ArticleState } from '@type/article.types';
import { createArticle as createArticleUsecase } from '@/domain/usecases/article/createArticle';
import { deleteArticle as deleteArticleUsecase } from '@/domain/usecases/article/deleteArticle';
import { fetchArticle as fetchArticleUsecase } from '@/domain/usecases/article/fetchArticle';
import { fetchArticles as fetchArticlesUsecase } from '@/domain/usecases/article/fetchArticles';
import { fetchUserArticles as fetchUserArticlesUsecase } from '@/domain/usecases/article/fetchUserArticles';
import { updateArticle as updateArticleUsecase } from '@/domain/usecases/article/updateArticle';
import { RootState } from '@/infrastructure/store';

const initialState: ArticleState = {
  articles: [],
  userArticles: [],
  currentArticle: null,
  loading: false,
  error: null,
  total: 0,
  hasMore: true,
  userArticlesHasMore: true,
  searchQuery: '',
};

export const createArticle = createAsyncThunk(
  'articles/create',
  async (
    { title, content, tags }: { title: string; content: string; tags: string[] },
    { rejectWithValue }
  ) => {
    try {
      return await createArticleUsecase(title, content, tags);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to create article');
    }
  }
);

export const updateArticle = createAsyncThunk(
  'articles/update',
  async (
    {
      id,
      articleData,
    }: {
      id: string;
      articleData: { title: string; content: string; tagIds: string[]; featured_image?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      return await updateArticleUsecase(id, articleData);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to update article');
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'articles/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteArticleUsecase(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to delete article');
    }
  }
);

export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async (
    { page, limit, filters }: { page: number; limit: number; filters?: string },
    { rejectWithValue }
  ) => {
    try {
      return await fetchArticlesUsecase(page, limit, filters);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Fetch articles failed');
    }
  }
);

export const fetchUserArticles = createAsyncThunk(
  'articles/fetchUserArticles',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const userId = state?.auth?.user?._id;
      if (!userId) {
        return rejectWithValue('User not authenticated');
      }
      return await fetchUserArticlesUsecase(userId, page, limit);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch user articles');
    }
  }
);

export const fetchArticle = createAsyncThunk(
  'articles/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      return await fetchArticleUsecase(id);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch article');
    }
  }
);

const articleSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.articles = [];
      state.hasMore = true;
    },
    resetState: (state) => {
      state.articles = [];
      state.currentArticle = null;
      state.loading = false;
      state.error = null;
      state.total = 0;
      state.hasMore = true;
      state.searchQuery = '';
    },
    setArticleReported: (state, action: PayloadAction<string>) => {
      if (state.currentArticle?._id === action.payload) {
        state.currentArticle.isReported = true;
      }
      const index = state.articles.findIndex((article) => article._id === action.payload);
      if (index !== -1) {
        state.articles[index].isReported = true;
      }
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
        if ('_id' in action.payload) {
          state.articles.push(action.payload);
        }
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || 'Failed to create article';
      })
      // Update Article
      .addCase(updateArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.articles.findIndex((article) => article._id === action.payload._id);
        if (index !== -1) {
          state.articles[index] = action.payload;
        }
        if (state.currentArticle?._id === action.payload._id) {
          state.currentArticle = action.payload;
        }
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || 'Failed to update article';
      })
      // Fetch All Articles
      .addCase(fetchArticles.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.articles = [];
        }
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        const newArticles = action.payload.articles;

        if (action.meta.arg.page === 1) {
          state.articles = newArticles;
        } else {
          const existingIds = new Set(state.articles.map((article) => article._id));
          const uniqueNewArticles = newArticles.filter(
            (article: { _id: string }) => !existingIds.has(article._id)
          );
          state.articles = [...state.articles, ...uniqueNewArticles];
        }

        state.total = action.payload.total;
        state.hasMore = newArticles.length === action.meta.arg.limit;
        console.log('Articles state updated:', {
          currentCount: state.articles.length,
          total: state.total,
          hasMore: state.hasMore,
          page: action.meta.arg.page,
          receivedArticles: newArticles.length,
          requestedLimit: action.meta.arg.limit,
        });
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch articles';
      })
      .addCase(fetchUserArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserArticles.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg.page === 1) {
          state.userArticles = action.payload.articles;
        } else {
          state.userArticles = [...state.userArticles, ...action.payload.articles];
        }
        state.userArticlesHasMore = state.userArticles.length < action.payload.total;
      })
      .addCase(fetchUserArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
        state.articles = state.articles.filter((article) => article._id !== action.payload);
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

export const { clearCurrentArticle, setSearchQuery, resetState, setArticleReported } =
  articleSlice.actions;
export default articleSlice.reducer;
