import { Title, Grid, Box, Stack, Paper } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useEffect, useMemo, useCallback } from 'react';
import { fetchLogs } from '@/store/slices/logSlice';
import { fetchArticles } from '@/store/slices/articleSlice';
import { fetchHomeData, selectHomeData, selectHomeLoading, selectHomeError } from '@/store/slices/homeSlice';
import LogRow from '@components/log/LogRow';
import ArticleRow from '@components/article/ArticleRow';
import { useNavigate } from 'react-router-dom';
import { FileTextIcon } from '@/components/icons/FileTextIcon';
import { MessageIcon } from '@/components/icons/MessageIcon';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { notifications } from '@mantine/notifications';
import { HomeSkeleton } from '@components/skeletons/HomeSkeleton';
import StatsCard from '@components/home/StatsCard';
import RecentItemsSection from '@components/home/RecentItemsSection';
import ActivityChart from '@components/home/ActivityChart';
import RecentActivitySection from '@components/home/RecentActivitySection';
import { formatRelativeDate } from '@/utils/dateUtils';

export default function Home() {
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { logs } = useSelector((state: RootState) => state.logs);
  const { articles } = useSelector((state: RootState) => state.articles);
  const { user, isInitialized: authInitialized } = useSelector((state: RootState) => state.auth);
  const { isInitialized: appInitialized } = useSelector((state: RootState) => state.init);
  const homeData = useSelector(selectHomeData);
  const homeLoading = useSelector(selectHomeLoading);
  const homeError = useSelector(selectHomeError);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const fetchData = useCallback(() => {
    if (appInitialized && authInitialized && user && user._id) {
      dispatch(fetchLogs({ page: 1, limit: 3 }));
      dispatch(fetchArticles({ page: 1, limit: 3 }));
      dispatch(fetchHomeData());
    }
  }, [dispatch, user, appInitialized, authInitialized]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (homeError) {
      notifications.show({
        title: 'Error',
        message: homeError,
        color: 'red',
      });
    }
  }, [homeError]);

  const statsData = useMemo(() => [
    {
      label: 'Total Logs',
      value: homeData?.logsCount.toString() || '0',
      icon: <FileTextIcon width={28} />
    },
    {
      label: 'Articles Written',
      value: homeData?.articlesCount.toString() || '0',
      icon: <FileTextIcon width={28} />
    },
    {
      label: 'Messages',
      value: homeData?.messagesCount.toString() || '0',
      icon: <MessageIcon width={28} />
    },
    {
      label: 'Followers',
      value: homeData?.followersCount.toString() || '0',
      icon: <UsersIcon width={28} />
    },
  ], [homeData]);

  const containerClassName = `page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  if (!appInitialized || !authInitialized || !user || !user._id || homeLoading) {
    return (
      <Box className={containerClassName}>
        {homeLoading ? (
          <HomeSkeleton />
        ) : (
          <Stack gap="xl">
            <Title order={1} fw={700}>
              Loading...
            </Title>
          </Stack>
        )}
      </Box>
    );
  }

  return (
    <Box className={containerClassName}>
      <Stack gap="xl">
        <Title order={1} fw={700}>
          Welcome, {user?.name || 'User'}
        </Title>

        {/* Stats Section */}
        <Grid gutter="md">
          {statsData.map((stat, index) => (
            <Grid.Col span={{ base: 6, sm: 3 }} key={index}>
              <StatsCard {...stat} />
            </Grid.Col>
          ))}
        </Grid>

        {/* Recent Activity & Weekly Log Activity */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <RecentActivitySection 
              activities={homeData?.recentActivities || []}
              formatDate={formatRelativeDate}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" radius="md" p="md" withBorder>
              <Title order={2} fw={600} mb="md">Weekly Activity</Title>
              <ActivityChart 
                data={homeData?.chartData || []}
                onNewLog={() => navigate('/logs/create')}
                onWriteArticle={() => navigate('/articles/create')}
              />
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Recent Logs */}
        <RecentItemsSection
          title="Recent Logs"
          items={logs.map(log => <LogRow key={log._id} log={log} />)}
          emptyMessage="No recent logs available."
          viewMorePath="/logs"
          onViewMore={() => navigate('/logs')}
        />

        {/* Recent Articles */}
        <RecentItemsSection
          title="Recent Articles"
          items={articles.map(article => <ArticleRow key={article._id} article={article} />)}
          emptyMessage="No recent articles available."
          viewMorePath="/articles"
          onViewMore={() => navigate('/articles')}
        />
      </Stack>
    </Box>
  );
} 