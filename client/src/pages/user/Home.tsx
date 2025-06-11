import { Title, Text, Button, Group, Grid, Paper, Box, Stack, useMantineColorScheme, ActionIcon, Loader } from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect } from 'react';
import { fetchLogs } from '@/store/slices/logSlice';
import { fetchArticles } from '@/store/slices/articleSlice';
import { fetchHomeData, selectHomeData, selectHomeLoading, selectHomeError } from '@/store/slices/homeSlice';
import LogRow from '@components/log/LogRow';
import ArticleRow from '@components/article/ArticleRow';
import { useNavigate } from 'react-router-dom';
import { IconFileText, IconMessages, IconUsers } from '@tabler/icons-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { notifications } from '@mantine/notifications';
import { HomeSkeleton } from '@components/skeletons/HomeSkeleton';

export default function Home() {
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { logs } = useSelector((state: RootState) => state.logs);
  const { articles } = useSelector((state: RootState) => state.articles);
  const { user } = useSelector((state: RootState) => state.auth);
  const homeData = useSelector(selectHomeData);
  const homeLoading = useSelector(selectHomeLoading);
  const homeError = useSelector(selectHomeError);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    dispatch(fetchLogs({ page: 1, limit: 3 }));
    dispatch(fetchArticles({ page: 1, limit: 3 }));
    dispatch(fetchHomeData());
  }, [dispatch]);

  useEffect(() => {
    if (homeError) {
      notifications.show({
        title: 'Error',
        message: homeError,
        color: 'red',
      });
    }
  }, [homeError]);

  const statsData = [
    { 
      label: 'Total Logs', 
      value: homeData?.logsCount.toString() || '0', 
      icon: <IconFileText size={28} /> 
    },
    { 
      label: 'Articles Written', 
      value: homeData?.articlesCount.toString() || '0', 
      icon: <IconFileText size={28} /> 
    },
    { 
      label: 'Messages', 
      value: homeData?.messagesCount.toString() || '0', 
      icon: <IconMessages size={28} /> 
    },
    { 
      label: 'Followers', 
      value: homeData?.followersCount.toString() || '0', 
      icon: <IconUsers size={28} /> 
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (homeLoading) {
    return (
      <Box
        className={`page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`}
      >
        <HomeSkeleton />
      </Box>
    );
  }

  return (
    <Box
      className={`page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`}
    >
      <Stack gap="xl">
        {/* Welcome Section */}
        <Title order={1} fw={700}>
          Welcome, {user?.name || 'User'}
        </Title>

        {/* Stats Section */}
        <Grid gutter="md">
          {statsData.map((stat, index) => (
            <Grid.Col span={{ base: 6, sm: 3 }} key={index}>
              <Paper shadow="sm" radius="md" p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <ActionIcon variant="light" color="blue" radius="xl" size={40}>
                      {stat.icon}
                    </ActionIcon>
                  </Group>
                  <Text size="xl" fw={700}>
                    {stat.value}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {stat.label}
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>

        {/* Recent Activity & Weekly Log Activity */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" radius="md" p="md" withBorder>
              <Title order={2} fw={600} mb="md">Recent Activity</Title>
              <Stack gap="sm">
                {homeData?.recentActivities.map((activity, index) => (
                  <Box key={index} py="xs">
                    <Text fw={500}>
                      {activity.type === 'log' ? 'Created a log' : 'Published an article'}: {activity.title}
                    </Text>
                    <Text size="sm" c="dimmed">{formatDate(activity.createdAt)}</Text>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" radius="md" p="md" withBorder>
              <Title order={2} fw={600} mb="md">Weekly Activity</Title>
              <Box
                style={{
                  height: 200,
                  width: '100%',
                  borderRadius: 'var(--mantine-radius-md)',
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={homeData?.chartData.map(item => ({
                      day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
                      logs: item.logs,
                      articles: item.articles
                    }))}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)'} 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="day" 
                      stroke={isDark ? 'var(--mantine-color-dark-2)' : 'var(--mantine-color-gray-6)'} 
                      tick={{ fill: isDark ? 'var(--mantine-color-dark-0)' : 'var(--mantine-color-gray-7)' }}
                      axisLine={{ stroke: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)' }}
                    />
                    <YAxis 
                      stroke={isDark ? 'var(--mantine-color-dark-2)' : 'var(--mantine-color-gray-6)'} 
                      tick={{ fill: isDark ? 'var(--mantine-color-dark-0)' : 'var(--mantine-color-gray-7)' }}
                      axisLine={{ stroke: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
                        border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
                        borderRadius: 'var(--mantine-radius-md)',
                        boxShadow: 'var(--mantine-shadow-md)',
                      }}
                      labelStyle={{ 
                        color: isDark ? 'var(--mantine-color-dark-0)' : 'var(--mantine-color-gray-9)',
                        fontWeight: 500,
                      }}
                      itemStyle={{
                        color: isDark ? 'var(--mantine-color-dark-0)' : 'var(--mantine-color-gray-9)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="logs"
                      stroke="var(--mantine-color-blue-6)"
                      strokeWidth={2}
                      dot={{ 
                        r: 4,
                        fill: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
                        strokeWidth: 2,
                      }}
                      activeDot={{ 
                        r: 6,
                        fill: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
                        strokeWidth: 2,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="articles"
                      stroke="var(--mantine-color-green-6)"
                      strokeWidth={2}
                      dot={{ 
                        r: 4,
                        fill: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
                        strokeWidth: 2,
                      }}
                      activeDot={{ 
                        r: 6,
                        fill: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <Group mt="md" justify="space-between">
                <Button variant="default" leftSection={<IconFileText size={18} />} onClick={() => navigate('/logs/new')}>New Log</Button>
                <Button variant="default" leftSection={<IconFileText size={18} />} onClick={() => navigate('/articles/new')}>Write Article</Button>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Group justify="space-between" align="center">
            <Title order={2}>Recent Logs</Title>
          </Group>
          <Stack mt="md" gap="md">
            {logs.length === 0 ? (
              <Text c="dimmed">No recent logs available.</Text>
            ) : (
              logs.map(log => <LogRow key={log._id} log={log} />)
            )}
          </Stack>
          {logs.length > 0 && (
            <Group justify="center" mt="md">
              <Button variant="subtle" onClick={() => navigate('/logs')}>View More</Button>
            </Group>
          )}
        </Paper>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Group justify="space-between" align="center">
            <Title order={2}>Recent Articles</Title>
          </Group>
          <Stack mt="md" gap="md">
            {articles.length === 0 ? (
              <Text c="dimmed">No recent articles available.</Text>
            ) : (
              articles.map(article => <ArticleRow key={article._id} article={article} />)
            )}
          </Stack>
          {articles.length > 0 && (
            <Group justify="center" mt="md">
              <Button variant="subtle" onClick={() => navigate('/articles')}>View More</Button>
            </Group>
          )}
        </Paper>
      </Stack>
    </Box>
  );
} 