import { Box, Group, Stack, Text, Title, Select, Chip, Center, Pagination } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchArticles } from '@slices/articleSlice';
import { fetchTags } from '@slices/tagSlice';
import CreateButton from '@components/CreateButton';
import ArticleRow from '@components/article/ArticleRow';
import ArticleRowSkeleton from '@components/article/ArticleRowSkeleton';
import { useMediaQuery } from '@mantine/hooks';

interface ArticleFilters {
  tagIds: string[];
  isActive: boolean;
}

export default function ArticlesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('new');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  const { articles, loading, total } = useSelector((state: RootState) => state.articles);
  const { tags } = useSelector((state: RootState) => state.tags);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    const filters: ArticleFilters = {
      tagIds: [],
      isActive: true
    };

    dispatch(fetchArticles({
      page,
      limit: pageSize,
      sortBy: sortBy === 'new' ? 'createdAt' : 'createdAt',
      sortOrder: sortBy === 'old' ? 'asc' : 'desc',
      filters: JSON.stringify(filters)
    }));
  }, [dispatch, page, pageSize, sortBy]);

  const handleSortChange = (value: string | null) => {
    if (value) {
      setSortBy(value);
      setPage(1); // Reset to first page when changing sort
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
              ]}
              value={sortBy}
              onChange={handleSortChange}
              size="xs"
              radius="md"
              checkIconPosition="right"
            />
          </Group>
        </Group>

        {/* Tags Filter */}
        <Stack gap="xs">
          <Text fw={500}>Filter by Tags:</Text>
          <Group gap="xs" wrap="wrap">
            {tags.map((tag) => (
              <Chip
                key={tag._id}
                checked={false}
                disabled
                size="sm"
                variant="light"
                color="blue"
              >
                {tag.name}
              </Chip>
            ))}
          </Group>
        </Stack>

        <Stack gap="md">
          {loading ? (
            renderSkeletons()
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <ArticleRow key={article._id} article={article} />
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" size="sm">No articles found</Text>
            </Center>
          )}

          {!loading && articles.length > 0 && (
            <Stack gap="md" mt="md">
              <Group justify="space-between" wrap="wrap" gap="md">
                <Select
                  label="Page size"
                  value={pageSize.toString()}
                  onChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                  data={[
                    { value: '5', label: '5 per page' },
                    { value: '10', label: '10 per page' },
                    { value: '20', label: '20 per page' },
                    { value: '50', label: '50 per page' },
                  ]}
                  style={{ width: '150px' }}
                />
                <Pagination
                  total={Math.ceil(total / pageSize)}
                  value={page}
                  onChange={setPage}
                  withEdges
                  size={isMobile ? 'sm' : 'md'}
                />
              </Group>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Box pos="fixed" bottom={24} right={24}>
        <CreateButton />
      </Box>
    </Box>
  );
}
