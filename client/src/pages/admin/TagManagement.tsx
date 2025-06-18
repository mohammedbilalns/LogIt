import { useEffect, useState, useCallback, useMemo } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Grid,
  Group,
  Loader,
  Pagination,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
  Flex,
} from '@mantine/core';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchTagsForManagement, 
  promoteTagInManagement, 
  demoteTagInManagement,
  setSearchQuery,
  setPage,
  setPageSize
} from '@/store/slices/tagManagementSlice';

export default function TagManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 500);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

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

  const containerStyle = useMemo(() => ({
    marginLeft: isOpen && !isMobile ? '266px' : '0px',
    transition: 'margin-left 0.3s ease',
    width: isOpen && !isMobile ? 'calc(100% - 266px)' : '100%',
    maxWidth: '100%',
  }), [isOpen, isMobile]);

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
    <Box style={containerStyle}>
      <Stack gap="lg">
        <Paper
          shadow="xs"
          p="md"
          withBorder
          style={{
            backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
          }}
        >
          <Stack gap="md">
            <Title order={2} fw={600}>
              Tag Management
            </Title>
            <TextInput
              placeholder="Search tags"
              leftSection={<IconSearch size={16} />}
              value={searchInput}
              onChange={handleSearchChange}
              style={{ width: '100%', maxWidth: isTablet ? '100%' : '400px' }}
              size="md"
            />
          </Stack>
        </Paper>

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
                    <Loader size="md" />
                    <Text size="sm" c="dimmed">
                      Loading promoted tags...
                    </Text>
                  </Center>
                </Grid.Col>
              ) : errorPromotedTags && promotedTags.length === 0 ? (
                <Grid.Col span={12}>
                  <Center h={100}>
                    <Text c="red" size="sm">
                      {errorPromotedTags}
                    </Text>
                  </Center>
                </Grid.Col>
              ) : promotedTags.length === 0 ? (
                <Grid.Col span={12}>
                  <Center h={100}>
                    <Text c="dimmed">No promoted tags found</Text>
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
              <Box
                style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderTop: '1px solid var(--mantine-color-gray-3)',
                }}
              >
                <Stack align="center" gap="xs">
                  <Loader size="md" />
                  <Text size="sm" c="dimmed">
                    Loading tags...
                  </Text>
                </Stack>
              </Box>
            ) : errorAllTags && tags.length === 0 ? (
              <Box
                style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderTop: '1px solid var(--mantine-color-gray-3)',
                }}
              >
                <Text c="red" size="sm">
                  {errorAllTags}
                </Text>
              </Box>
            ) : !loadingAllTags && !errorAllTags && tags.length === 0 ? (
              <Box
                style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderTop: '1px solid var(--mantine-color-gray-3)',
                }}
              >
                <Text c="dimmed" size="sm">
                  No tags found
                </Text>
              </Box>
            ) : (
              <Stack gap="md" mt="md">
                <Flex 
                  justify="space-between" 
                  align="center" 
                  wrap="wrap" 
                  gap="md"
                  direction={isMobile ? "column" : "row"}
                >
                  <Select
                    label={isMobile ? undefined : "Page size"}
                    placeholder={isMobile ? "Page size" : undefined}
                    value={pageSize.toString()}
                    onChange={handlePageSizeChange}
                    data={[
                      { value: '5', label: '5 per page' },
                      { value: '10', label: '10 per page' },
                      { value: '20', label: '20 per page' },
                      { value: '50', label: '50 per page' },
                    ]}
                    style={{ width: isMobile ? '100%' : '150px' }}
                    size={isMobile ? 'sm' : 'md'}
                  />
                  <Pagination
                    total={Math.ceil(total / pageSize)}
                    value={currentPage}
                    onChange={handlePageChange}
                    withEdges
                    size={isMobile ? 'sm' : 'md'}
                  />
                </Flex>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
