import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Badge,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { AppDispatch, RootState } from '@/infrastructure/store';
import { 
  fetchTagsForManagement, 
  promoteTagInManagement, 
  demoteTagInManagement,
  setSearchQuery,
  setPage,
  setPageSize
} from '@/infrastructure/store/slices/tagManagementSlice';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import AdminPageContainer from '@/presentation/components/admin/AdminPageContainer';
import AdminPageHeader from '@/presentation/components/admin/AdminPageHeader';
import ResponsivePagination from '@/presentation/components/admin/Pagination';
import LoadingState from '@/presentation/components/admin/LoadingState';
import EmptyState from '@/presentation/components/admin/EmptyState';
import ErrorState from '@/presentation/components/admin/ErrorState';

export default function TagManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 500);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const {
    tags,
    total,
    promotedTags,
    loadingAllTags,
    errorAllTags,
    loadingPromotedTags,
    errorPromotedTags,
    currentPage,
    pageSize,
    searchQuery,
  } = useSelector((state: RootState) => state.tagManagement);

  const handlePromoteUnpromote = useCallback(async (tagId: string, promote: boolean) => {
    try {
      if (promote) {
        await dispatch(promoteTagInManagement(tagId)).unwrap();
        notifications.show({
          title: 'Success',
          message: 'Tag promoted successfully',
          color: 'green',
        });
      } else {
        await dispatch(demoteTagInManagement(tagId)).unwrap();
        notifications.show({
          title: 'Success',
          message: 'Tag unpromoted successfully',
          color: 'red',
        });
      }
      // Re-fetch both sets of tags
      dispatch(fetchTagsForManagement({ 
        page: currentPage, 
        limit: pageSize, 
        search: searchQuery, 
        promoted: false 
      }));
      dispatch(fetchTagsForManagement({ 
        promoted: true, 
        limit: 100, 
        search: searchQuery 
      }));
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to update tag status',
        color: 'red',
      });
    }
  }, [dispatch, currentPage, pageSize, searchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.currentTarget.value);
  }, []);

  const handlePageSizeChange = useCallback((value: string | null) => {
    if (value) {
      dispatch(setPageSize(Number(value)));
    }
  }, [dispatch]);

  const handlePageChange = useCallback((value: number) => {
    dispatch(setPage(value));
  }, [dispatch]);

  const allTagsParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    promoted: false,
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
  }), [currentPage, pageSize, debouncedSearch]);

  const promotedTagsParams = useMemo(() => ({
    promoted: true,
    limit: 100,
    search: debouncedSearch,
  }), [debouncedSearch]);

  // Update search query when debounced search changes
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch));
  }, [dispatch, debouncedSearch]);

  // Fetch all tags
  useEffect(() => {
    dispatch(fetchTagsForManagement(allTagsParams));
  }, [dispatch, allTagsParams]);

  // Fetch promoted tags
  useEffect(() => {
    dispatch(fetchTagsForManagement(promotedTagsParams));
  }, [dispatch, promotedTagsParams]);

  return (
    <AdminPageContainer>
      <Stack gap="lg">
        <AdminPageHeader
          title="Tag Management"
          searchPlaceholder="Search tags"
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
        />

        {/* Promoted Tags Section */}
        <Paper shadow="xs" p="md" withBorder>
          <Stack gap="md">
            <Title order={3} fw={600}>
              Promoted Tags
            </Title>
            <Grid grow>
              {loadingPromotedTags && promotedTags.length === 0 ? (
                <Grid.Col span={12}>
                  <Center h={100}>
                    <LoadingState message="Loading promoted tags..." showBorder={false} />
                  </Center>
                </Grid.Col>
              ) : errorPromotedTags && promotedTags.length === 0 ? (
                <Grid.Col span={12}>
                  <Center h={100}>
                    <ErrorState message={errorPromotedTags} showBorder={false} />
                  </Center>
                </Grid.Col>
              ) : promotedTags.length === 0 ? (
                <Grid.Col span={12}>
                  <Center h={100}>
                    <EmptyState message="No promoted tags found" showBorder={false} />
                  </Center>
                </Grid.Col>
              ) : (
                promotedTags.map((tag) => (
                  <Grid.Col span={{ base: 12, xs: 6, sm: 4, lg: 3 }} key={tag._id}>
                    <Card withBorder p="md" radius="md">
                      <Stack gap="xs">
                        <Text fw={500} size="lg">
                          {tag.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Usage: {tag.usageCount}
                        </Text>
                        <Button
                          color="red"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromoteUnpromote(tag._id, false)}
                        >
                          UnPromote
                        </Button>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))
              )}
            </Grid>
          </Stack>
        </Paper>

        {/* All Tags Section */}
        <Paper shadow="xs" p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="center" wrap="wrap">
              <Title order={3} fw={600}>
                All Tags
              </Title>
            </Group>

            <ScrollArea>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '250px' }}>Tag</Table.Th>
                    <Table.Th style={{ width: '150px' }}>
                      Usage Count
                    </Table.Th>
                    <Table.Th style={{ width: '150px' }}>Status</Table.Th>
                    <Table.Th style={{ width: '120px' }}>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {tags.map((tag) => (
                    <Table.Tr key={tag._id}>
                      <Table.Td>
                        <Text size="md" fw={500} lineClamp={1}>
                          {tag.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="md">{tag.usageCount}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={tag.promoted ? 'green' : 'gray'}
                          variant="light"
                          size="lg"
                        >
                          {tag.promoted ? 'Promoted' : 'Not Promoted'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          color={tag.promoted ? 'red' : 'blue'}
                          size="sm"
                          onClick={() => handlePromoteUnpromote(tag._id, !tag.promoted)}
                        >
                          {tag.promoted ? 'UnPromote' : 'Promote'}
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {loadingAllTags && tags.length === 0 ? (
              <LoadingState message="Loading tags..." />
            ) : errorAllTags && tags.length === 0 ? (
              <ErrorState message={errorAllTags} />
            ) : !loadingAllTags && !errorAllTags && tags.length === 0 ? (
              <EmptyState message="No tags found" />
            ) : (
              <ResponsivePagination
                currentPage={currentPage}
                totalPages={Math.ceil(total / pageSize)}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </Stack>
        </Paper>
      </Stack>
    </AdminPageContainer>
  );
}
