import { Box, Group, Stack, Text, Title, Select, Chip, Center, Paper } from '@mantine/core';
import  { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchArticles } from '@slices/articleSlice';
import { fetchPromotedAndUserTags } from '@slices/tagSlice';
import CreateButton from '@components/CreateButton';
import ArticleRow from '@components/article/ArticleRow';
import ArticleRowSkeleton from '@components/article/ArticleRowSkeleton';
import { useMediaQuery } from '@mantine/hooks';
import TagSearchSelector from '@components/TagSearchSelector';

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const userId = useSelector((state: RootState) => state.auth.user?._id);

  useEffect(() => {
    dispatch(fetchPromotedAndUserTags({ limit: 5 }));
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
      tagIds: [...selectedTags, ...searchTags],
      isActive: true
    };

    dispatch(fetchArticles({
      page,
      limit: pageSize,
      sortBy: sortBy === 'new' ? 'createdAt' : 'createdAt',
      sortOrder: sortBy === 'old' ? 'asc' : 'desc',
      filters: JSON.stringify(filters)
    }));
  }, [dispatch, page, pageSize, sortBy, selectedTags, searchTags]);

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
      className={`page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`}
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

        {/* Tags Filter Section */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            {/* Quick Select Tags */}
            <Stack gap="xs">
              <Text fw={500}>Quick Select Tags:</Text>
              <Group gap="xs" wrap="wrap">
                {tags.map((tag) => (
                  <Chip
                    key={tag._id}
                    checked={selectedTags.includes(tag._id)}
                    onChange={(checked) => {
                      if (checked) {
                        setSelectedTags([...selectedTags, tag._id]);
                      } else {
                        setSelectedTags(selectedTags.filter(id => id !== tag._id));
                      }
                    }}
                    size="sm"
                    variant="light"
                    color="blue"
                  >
                    {tag.name}
                  </Chip>
                ))}
              </Group>
            </Stack>

            {/* Tag Search */}
            <TagSearchSelector
              label="Search Additional Tags"
              description="Search and select more tags to filter articles"
              value={searchTags}
              onChange={setSearchTags}
            />
          </Stack>
        </Paper>

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
