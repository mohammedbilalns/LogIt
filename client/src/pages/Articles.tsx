import { Box, Group, Stack, Text, Title, Select, Chip, Center } from '@mantine/core';
import React, { useEffect, useState, useRef } from 'react';
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
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('new');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const { articles, loading, hasMore } = useSelector((state: RootState) => state.articles);
  const { tags } = useSelector((state: RootState) => state.tags);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    const currentObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log('Intersection observer:', {
          isIntersecting: entry.isIntersecting,
          hasMore,
          loading,
          currentPage: page
        });

        if (entry.isIntersecting && hasMore && !loading) {
          console.log('Loading more articles, current page:', page);
          setPage(prev => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      currentObserver.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        currentObserver.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page]);

  useEffect(() => {
    console.log('Fetching articles:', { page, pageSize, sortBy });
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
      setPage(1);
    }
  };

  const renderSkeletons = () => {
    return Array(2).fill(0).map((_, index) => (
      <ArticleRowSkeleton key={`skeleton-${index}`} />
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
          {articles.length > 0 ? (
            <>
              {articles.map((article) => (
                <ArticleRow key={article._id} article={article} />
              ))}
              <div ref={observerTarget} style={{ height: '20px', width: '100%' }} />
              {loading && page > 1 && renderSkeletons()}
            </>
          ) : loading ? (
            renderSkeletons()
          ) : (
            <Center py="xl">
              <Text c="dimmed" size="sm">No articles found</Text>
            </Center>
          )}
        </Stack>
      </Stack>

      <Box pos="fixed" bottom={24} right={24}>
        <CreateButton />
      </Box>
    </Box>
  );
}
