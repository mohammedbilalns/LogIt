export interface UpdateProfileData {
  name?: string;
  profileImage?: string;
  profession?: string;
  bio?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface RecentActivity {
  type: 'log' | 'article';
  id?: string;
  title: string;
  createdAt: Date;
}

export interface ChartDataPoint {
  date: string;
  logs: number;
  articles: number;
}

export interface HomeData {
  articlesCount: number;
  logsCount: number;
  messagesCount: number;
  followersCount: number;
  recentActivities: RecentActivity[];
  chartData: ChartDataPoint[];
} 