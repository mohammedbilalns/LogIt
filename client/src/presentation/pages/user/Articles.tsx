import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ArticleRow from '@/presentation/components/article/ArticleRow';
import { fetchArticles } from '@/infrastructure/store/slices/articleSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Center, Group, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import ArticleRowSkeleton from '@/presentation/components/skeletons/ArticleRowSkeleton';
import SortBy from '@/presentation/components/SortBy';
import TagFilterSection from '@/presentation/components/tags/TagFilterSection';
import CreateButton from '@/presentation/components/user/CreateButton';
import { AppDispatch, RootState } from '@/infrastructure/store';
import { useInfiniteScroll } from '@/application/hooks/useInfiniteScroll';


export default function ArticlesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('new');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const { articles: articlesRaw, loading, hasMore } = useSelector((state: RootState) => state.articles);
  const articles = Array.isArray(articlesRaw) ? articlesRaw : [];
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTags, setSearchTags] = useState<string[]>([]);

  const filters = useMemo(
    () => ({
      tagIds: [...selectedTags, ...searchTags],
      isActive: true,
    }),
    [selectedTags, searchTags]
  );

  const skeletons = useMemo(
    () =>
      Array(2)
        .fill(0)
        .map((_, index) => <ArticleRowSkeleton key={`skeleton-${index}`} />),
    []
  );

  useInfiniteScroll({
    targetRef: observerTarget,
    loading,
    hasMore,
    onLoadMore: () => setPage((prev) => prev + 1),
  });

  useEffect(() => {
    dispatch(
      fetchArticles({
        page,
        limit: pageSize,
        filters: JSON.stringify(filters),
        sortBy: 'createdAt',
        sortOrder: sortBy === 'old' ? 'asc' : 'desc',
      })
    );
  }, [dispatch, page, pageSize, sortBy, filters]);

  const handleSortChange = useCallback((value: string | null) => {
    if (value) {
      setSortBy(value);
      setPage(1);
    }
  }, []);

  const handleTagChange = useCallback((tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTags((prev) => [...prev, tagId]);
    } else {
      setSelectedTags((prev) => prev.filter((id) => id !== tagId));
    }
  }, []);

  const containerClassName = `user-page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  return (
    <Box className={containerClassName}>
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap" gap="md">
          <Title order={2}>Articles</Title>
          <SortBy value={sortBy} onChange={handleSortChange} />
        </Group>

        <TagFilterSection
          selectedTags={selectedTags}
          searchTags={searchTags}
          onSelectedTagsChange={handleTagChange}
          onSearchTagsChange={setSearchTags}
          searchDescription="Search and select more tags to filter articles"
        />

        <Stack gap="md">
          {articles.length > 0 ? (
            <>
              {articles.map((article) => (
                <ArticleRow key={article._id} article={article} />
              ))}
              <div ref={observerTarget} style={{ height: '20px', width: '100%' }} />
              {loading && page > 1 && skeletons}
            </>
          ) : loading ? (
            skeletons
          ) : (
            <Center py="xl">
              <Text c="dimmed" size="sm">
                No articles found
              </Text>
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
