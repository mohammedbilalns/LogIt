import { Title, Text, Button, Group } from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useMediaQuery } from '@mantine/hooks';
import React, { useEffect } from 'react';
import { fetchLogs } from '@/store/slices/logSlice';
import { fetchArticles } from '@/store/slices/articleSlice';
import LogRow from '@components/log/LogRow';
import ArticleRow from '@components/article/ArticleRow';
import { Stack, Paper, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { logs } = useSelector((state: RootState) => state.logs);
  const { articles } = useSelector((state: RootState) => state.articles);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    dispatch(fetchLogs({ page: 1, limit: 3 }));
    dispatch(fetchArticles({ page: 1, limit: 3 }));
  }, [dispatch]);

  return (
    <Box
      style={{
        marginLeft: isMobile ? '16px' : (isSidebarOpen ? '290px' : '16px'),
        marginRight: isMobile ? '16px' : '30px',
        paddingLeft: isMobile ? '0' : '16px',
        marginTop: '100px',
        paddingBottom: '100px',
        transition: 'margin-left 0.3s ease',
      }}>
      
      <Stack>
        {/* Recent Logs Section */}
        <Paper shadow="sm" radius="md" p="md">
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

        {/* Recent Articles Section */}
        <Paper shadow="sm" radius="md" p="md">
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