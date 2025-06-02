import { Box, Button, Group, Stack, Text, Title, Select, Chip, Center } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchArticles } from '@slices/articleSlice';
import { fetchTags } from '@slices/tagSlice';
import CreateButton from '@components/CreateButton';
import ArticleRow from '@components/article/ArticleRow';
import ArticleRowSkeleton from '@components/article/ArticleRowSkeleton';
import { useMediaQuery } from '@mantine/hooks';

export default function ArticlesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const limit = 10;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

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

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <ArticleRowSkeleton key={index} />
    ));
  };

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
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap" gap="md">
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
        <Stack gap="xs">
          <Text fw={500}>Recent Tags:</Text>
          <Group gap="xs" wrap="wrap">
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
        </Stack>

        <Stack gap="md">
          {loading && page === 1 ? (
            renderSkeletons()
          ) : (
            articles.map((article) => (
              <ArticleRow key={article._id} article={article} />
            ))
          )}
        </Stack>

        {hasMore && (
          <Center mt="xl">
            <Button 
              variant="light" 
              onClick={handleLoadMore}
              loading={loading && page > 1}
            >
              Load More
            </Button>
          </Center>
        )}
      </Stack>

      <Box pos="fixed" bottom={24} right={24}>
        <CreateButton />
      </Box>
    </Box>
  );
}
