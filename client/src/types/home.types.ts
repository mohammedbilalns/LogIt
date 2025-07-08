export interface HomeData {
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