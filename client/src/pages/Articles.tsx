import { Box, Button, Group, Image, Stack, Text, Title, Select, Chip, Paper, Loader, Center } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchArticles } from '../store/slices/articleSlice';
import { fetchTags } from '../store/slices/tagSlice';
import CreateButton from '../components/CreateButton';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { IconArticle } from '@tabler/icons-react';

const MAX_VISIBLE_LINES = 2;

export default function ArticlesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { articles, loading, hasMore } = useSelector((state: RootState) => state.articles);
  const { tags } = useSelector((state: RootState) => state.tags);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchArticles({
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }));
  }, [dispatch, page]);

  const handleLoadMore = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const renderArticleContent = (content: string, articleId: string) => {
    return (
      <Box mt={4}>
        <Box style={{ 
          maxHeight: `${MAX_VISIBLE_LINES * 1.5}em`,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <ReactMarkdown 
            rehypePlugins={[rehypeRaw]} 
            remarkPlugins={[remarkGfm]}
            components={{
              img: () => null,
              p: ({ children }) => (
                <Text size="sm" lineClamp={MAX_VISIBLE_LINES}>{children}</Text>
              )
            }}
          >
            {content}
          </ReactMarkdown>
          <Box
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2em',
              background: 'linear-gradient(transparent, white)',
              pointerEvents: 'none'
            }}
          />
        </Box>
        <Button 
          variant="subtle" 
          size="xs" 
          onClick={() => navigate(`/articles/${articleId}`)}
          mt={4}
        >
          View Full Article
        </Button>
      </Box>
    );
  };

  const renderArticleImage = (article: any) => {
    if (article.featured_image) {
      return (
        <Image 
          src={article.featured_image} 
          alt={article.title}
          w={120} 
          h={100} 
          fit="cover" 
          radius="md"
        />
      );
    }

    return (
      <Box
        w={120}
        h={100}
        bg="gray.1"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px solid #eee'
        }}
      >
        <IconArticle size={32} color="#666" />
      </Box>
    );
  };

  if (loading && page === 1) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Box ml={290} mt={100} mr={30} pl="md" pb={100}>
      <Group justify="space-between" mb="md">
        <Title order={2}>Articles</Title>

        <Group>
          <Text fw={500}>Sort By:</Text>
          <Select
            data={[
              { value: 'new', label: 'New To Old' },
              { value: 'old', label: 'Old To New' },
              { value: 'tagUsage', label: 'Most Used Tags' },
            ]}
            value="new"
            size="xs"
            radius="md"
            checkIconPosition="right"
            disabled
          />
        </Group>
      </Group>

      {/* Recent Tags */}
      <Group mb="md" align="flex-start">
        <Text fw={500} mt={6}>Recent Tags:</Text>
        <Group gap="xs">
          {tags.map((tag) => (
            <Chip
              key={tag._id}
              checked={false}
              size="sm"
              variant="light"
              color="blue"
            >
              {tag.name}
            </Chip>
          ))}
          {tags.length > 5 && (
            <Button 
              variant="subtle" 
              size="xs" 
              disabled
            >
              View More Tags
            </Button>
          )}
        </Group>
      </Group>

      <Stack gap="md">
        {articles.map((article) => (
          <Paper 
            key={article._id} 
            shadow="sm" 
            radius="md" 
            p="md" 
            withBorder
            style={{ 
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              },
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/articles/${article._id}`)}
          >
            <Group align="flex-start" wrap="nowrap">
              {renderArticleImage(article)}
              <Box style={{ flex: 1 }}>
                <Text fw={600} size="lg">{article.title}</Text>
                <Group gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>By {article.author}</Text>
                </Group>
                {renderArticleContent(article.content, article._id)}
                <Group gap="xs" mt={6} style={{ flexWrap: 'wrap' }}>
                  {article.tagNames.slice(0, 5).map(tag => (
                    <Chip 
                      key={tag} 
                      size="xs" 
                      checked 
                      readOnly
                      variant="light"
                      color="blue"
                    >
                      {tag}
                    </Chip>
                  ))}
                  {article.tagNames.length > 5 && (
                    <Chip 
                      size="xs" 
                      variant="light"
                      color="blue"
                      disabled
                    >
                      +{article.tagNames.length - 5} more
                    </Chip>
                  )}
                </Group>
                <Text size="xs" mt={4} c="dimmed">
                  {new Date(article.createdAt).toLocaleDateString()}
                </Text>
              </Box>
            </Group>
          </Paper>
        ))}
      </Stack>

      {hasMore && (
        <Center mt="xl">
          <Button 
            variant="light" 
            onClick={handleLoadMore}
            loading={loading}
          >
            Load More
          </Button>
        </Center>
      )}

      <CreateButton />
    </Box>
  );
}
