import { Title, Text, Button, Group, Grid, Paper, Box, Stack, useMantineColorScheme, ActionIcon } from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useMediaQuery } from '@mantine/hooks';
import  { useEffect } from 'react';
import { fetchLogs } from '@/store/slices/logSlice';
import { fetchArticles } from '@/store/slices/articleSlice';
import LogRow from '@components/log/LogRow';
import ArticleRow from '@components/article/ArticleRow';
import { useNavigate } from 'react-router-dom';
import { IconFileText, IconMessages, IconUsers } from '@tabler/icons-react';

export default function Home() {
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { logs } = useSelector((state: RootState) => state.logs);
  const { articles } = useSelector((state: RootState) => state.articles);
  const { user } = useSelector((state: RootState) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    dispatch(fetchLogs({ page: 1, limit: 3 }));
    dispatch(fetchArticles({ page: 1, limit: 3 }));
  }, [dispatch]);

  const statsData = [
    { label: 'Total Logs', value: '312', icon: <IconFileText size={28} /> },
    { label: 'Articles Written', value: '58', icon: <IconFileText size={28} /> },
    { label: 'Messages', value: '1,487', icon: <IconMessages size={28} /> },
    { label: 'Followers', value: '2,300', icon: <IconUsers size={28} /> },
  ];

  const recentActivityData = [
    { text: 'Logged a new symptom', time: '2 hours ago' },
    { text: 'Published an article', time: '1 day ago' },
    { text: 'Logged a new symptom', time: '2 days ago' },
  ];

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
                {recentActivityData.map((activity, index) => (
                  <Box key={index} py="xs">
                    <Text fw={500}>{activity.text}</Text>
                    <Text size="sm" c="dimmed">{activity.time}</Text>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" radius="md" p="md" withBorder>
              <Title order={2} fw={600} mb="md">Weekly Log Activity</Title>
              <Box
                style={{
                  height: 200,
                  backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-1)',
                  borderRadius: 'var(--mantine-radius-md)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: isDark ? 'white' : 'black',
                }}
              >
                <Text>Chart Placeholder</Text>
              </Box>
              <Group mt="md" justify="space-between">
                <Button variant="default" leftSection={<IconFileText size={18} />}>New Log</Button>
                <Button variant="default" leftSection={<IconFileText size={18} />}>Write Article</Button>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Existing Recent Logs Section (Moved to bottom) */}
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

        {/* Existing Recent Articles Section (Moved to bottom) */}
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