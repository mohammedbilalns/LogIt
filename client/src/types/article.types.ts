export interface Article {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    tagNames: string[];
    author: string;
    authorId: string;
    featured_image?: string | null;
    createdAt: string;
    updatedAt: string;
    isReported?: boolean;
  }
  
  
  export interface ArticleState {
    articles: Article[];
    userArticles: Article[];
    currentArticle: Article | null;
    loading: boolean;
    error: string | null;
    total: number;
    hasMore: boolean;
    userArticlesHasMore: boolean;
    searchQuery: string;
  }