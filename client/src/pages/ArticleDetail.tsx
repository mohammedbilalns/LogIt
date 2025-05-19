import { Box, Button, Group, Stack, Text, Title, Chip, Paper, Loader, Center } from '@mantine/core';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchArticle } from '../store/slices/articleSlice';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { IconEdit } from '@tabler/icons-react';

export default function ArticleDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentArticle: article, loading } = useSelector((state: RootState) => state.articles);
  const { user } = useSelector((state: RootState) => state.auth);

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
    <Box ml={290} mt={100} mr={30} pl="md" pb={100}>
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={1}>{article.title}</Title>
              <Group gap="xs" mt={4}>
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
              >
                Edit Article
              </Button>
            )}
          </Group>

          <Box mt="md">
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
                        maxHeight: '400px',
                        objectFit: 'contain'
                      }} 
                    />
                  </Box>
                )
              }}
            >
              {article.content}
            </ReactMarkdown>
          </Box>

          <Group gap="xs" mt="xl">
            {article.tags.map(tag => (
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