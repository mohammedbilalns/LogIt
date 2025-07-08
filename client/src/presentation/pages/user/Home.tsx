import { Title, Grid, Box, Stack, Paper, Group, Text, Button, SimpleGrid } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/infrastructure/store';
import { useEffect, useMemo, useCallback } from 'react';
import { fetchLogs } from '@/infrastructure/store/slices/logSlice';
import { fetchArticles } from '@/infrastructure/store/slices/articleSlice';
import { fetchHomeData, selectHomeData, selectHomeLoading, selectHomeError } from '@/infrastructure/store/slices/homeSlice';
import LogRow from '@/presentation/components/log/LogRow';
import ArticleRow from '@/presentation/components/article/ArticleRow';
import { useNavigate } from 'react-router-dom';
import { FileTextIcon } from '@/presentation/components/icons/FileTextIcon';
import { MessageIcon } from '@/presentation/components/icons/MessageIcon';
import { UsersIcon } from '@/presentation/components/icons/UsersIcon';
import { notifications } from '@mantine/notifications';
import { HomeSkeleton } from '@/presentation/components/skeletons/HomeSkeleton';
import StatsCard from '@/presentation/components/home/StatsCard';
import ActivityChart from '@/presentation/components/home/ActivityChart';
import RecentActivitySection from '@/presentation/components/home/RecentActivitySection';
import { formatDistanceToNow } from 'date-fns';

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
      icon: <FileTextIcon width={24} />
    },
    {
      label: 'Articles Written',
      value: homeData?.articlesCount.toString() || '0',
      icon: <FileTextIcon width={24} />
    },
    {
      label: 'Messages',
      value: homeData?.messagesCount.toString() || '0',
      icon: <MessageIcon width={24} />
    },
    {
      label: 'Followers',
      value: homeData?.followersCount.toString() || '0',
      icon: <UsersIcon width={24} />
    },
  ], [homeData]);

  const containerClassName = `user-page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  if (!appInitialized || !authInitialized || !user || !user._id || homeLoading) {
    return (
      <Box className={containerClassName}>
        {homeLoading ? (
          <HomeSkeleton />
        ) : (
          <Stack gap="lg">
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
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1} fw={700} size="h2">
            Welcome back, {user?.name || 'User'}
          </Title>
          <Group gap="sm">
            <Button 
              variant="filled" 
              size="sm" 
              leftSection={<FileTextIcon width={16} />}
              onClick={() => navigate('/logs/create')}
            >
              New Log
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              leftSection={<FileTextIcon width={16} />}
              onClick={() => navigate('/articles/create')}
            >
              Write Article
            </Button>
          </Group>
        </Group>

        {/* Stats Section  */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </SimpleGrid>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Paper shadow="sm" radius="md" p="md" withBorder>
              <RecentActivitySection 
                activities={homeData?.recentActivities || []}
                formatDate={(dateString) => formatDistanceToNow(new Date(dateString), { addSuffix: true })}
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Paper shadow="sm" radius="md" p="md" withBorder style={{ height: 'fit-content' }}>
              <Title order={3} fw={600} mb="md">Weekly Activity</Title>
              <ActivityChart 
                data={homeData?.chartData || []}
                onNewLog={() => navigate('/logs/create')}
                onWriteArticle={() => navigate('/articles/create')}
              />
            </Paper>
          </Grid.Col>
        </Grid>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Group justify="space-between" align="center" mb="sm">
            <Title order={3} fw={600}>Recent Logs</Title>
            <Button variant="subtle" size="sm" onClick={() => navigate('/logs')}>
              View All
            </Button>
          </Group>
          <Stack gap="xs">
            {logs.length === 0 ? (
              <Text c="dimmed" size="sm">No recent logs available.</Text>
            ) : (
              logs.map(log => <LogRow key={log._id} log={log} />)
            )}
          </Stack>
        </Paper>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Group justify="space-between" align="center" mb="sm">
            <Title order={3} fw={600}>Recent Articles</Title>
            <Button variant="subtle" size="sm" onClick={() => navigate('/articles')}>
              View All
            </Button>
          </Group>
          <Stack gap="xs">
            {articles.length === 0 ? (
              <Text c="dimmed" size="sm">No recent articles available.</Text>
            ) : (
              articles.map(article => <ArticleRow key={article._id} article={article} />)
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
} 