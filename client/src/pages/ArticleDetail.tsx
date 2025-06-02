import { Box, Button, Group, Stack, Text, Title, Chip, Paper, Loader, Center } from '@mantine/core';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import { fetchArticle } from '@slices/articleSlice';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { IconEdit } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

export default function ArticleDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentArticle: article, loading } = useSelector((state: RootState) => state.articles);
  const { user } = useSelector((state: RootState) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  useEffect(() => {
    if (id) {
      dispatch(fetchArticle(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!article) {
    return (
      <Center h="100vh">
        <Text size="xl" c="dimmed">Article not found</Text>
      </Center>
    );
  }

  const isAuthor = user?._id === article.authorId;

  return (
    <Box 
      style={{
        marginLeft: isMobile ? '16px' : (isSidebarOpen ? '290px' : '16px'),
        marginRight: isMobile ? '16px' : '30px',
        paddingLeft: isMobile ? '0' : '16px',
        marginTop: '100px',
        paddingBottom: '100px',
        transition: 'margin-left 0.3s ease',
      }}
    >
      <Paper shadow="sm" radius="md" p={isMobile ? "md" : "xl"} withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Title order={1} size={isMobile ? "h2" : "h1"} style={{ wordBreak: 'break-word' }}>{article.title}</Title>
              <Group gap="xs" mt={4} wrap="wrap">
                <Text size="sm" c="dimmed" fw={500}>By {article.author}</Text>
                <Text size="sm" c="dimmed">•</Text>
                <Text size="sm" c="dimmed">
                  {new Date(article.createdAt).toLocaleDateString()}
                </Text>
              </Group>
            </Box>
            
            {isAuthor && (
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => navigate(`/articles/${article._id}/edit`)}
                size={isMobile ? "sm" : "md"}
              >
                Edit Article
              </Button>
            )}
          </Group>

          <Box mt="md" style={{ wordBreak: 'break-word' }}>
            <ReactMarkdown 
              rehypePlugins={[rehypeRaw]} 
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ src, alt }) => (
                  <Box style={{ maxWidth: '100%', overflow: 'hidden' }}>
                    <img 
                      src={src} 
                      alt={alt} 
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        maxHeight: isMobile ? '300px' : '400px',
                        objectFit: 'contain'
                      }} 
                    />
                  </Box>
                ),
                p: ({ children }) => (
                  <Text size={isMobile ? "sm" : "md"} style={{ wordBreak: 'break-word' }}>{children}</Text>
                ),
                h1: ({ children }) => (
                  <Title order={1} size={isMobile ? "h2" : "h1"} style={{ wordBreak: 'break-word' }}>{children}</Title>
                ),
                h2: ({ children }) => (
                  <Title order={2} size={isMobile ? "h3" : "h2"} style={{ wordBreak: 'break-word' }}>{children}</Title>
                ),
                h3: ({ children }) => (
                  <Title order={3} size={isMobile ? "h4" : "h3"} style={{ wordBreak: 'break-word' }}>{children}</Title>
                ),
                pre: ({ children }) => (
                  <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>{children}</Box>
                ),
                code: ({ children }) => (
                  <Box component="code" style={{ wordBreak: 'break-word' }}>{children}</Box>
                )
              }}
            >
              {article.content}
            </ReactMarkdown>
          </Box>

          <Group gap="xs" mt="xl" wrap="wrap">
            {article.tagNames.map(tag => (
              <Chip 
                key={tag} 
                size="sm" 
                checked 
                readOnly
                variant="light"
                color="blue"
              >
                {tag}
              </Chip>
            ))}
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
} 