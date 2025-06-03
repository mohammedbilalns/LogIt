import { Box, Group, Stack, Text, Title, Select, Chip, Center, Pagination, Paper, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchLogs, deleteLog, Log } from '@slices/logSlice';
import { fetchTags } from '@slices/tagSlice';
import LogRow from '@components/log/LogRow';
import LogRowSkeleton from '@components/log/LogRowSkeleton';
import { useMediaQuery, useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import CreateButton from '@components/CreateButton';
import { notifications } from '@mantine/notifications';
import UserSidebar from '@components/user/UserSidebar';
import { useNavigate } from 'react-router-dom';

interface LogFilters {
  tagIds: string[];
}

export default function LogsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('new');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 500);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  const { logs, loading, total } = useSelector((state: RootState) => state.logs);
  const { tags } = useSelector((state: RootState) => state.tags);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    const filters: LogFilters = {
      tagIds: selectedTags,
    };

    dispatch(fetchLogs({
      page,
      limit: pageSize,
      search: debouncedSearch,
      sortBy: sortBy === 'new' ? 'createdAt' : 'createdAt',
      sortOrder: sortBy === 'old' ? 'asc' : 'desc',
      filters: JSON.stringify(filters)
    }));
  }, [dispatch, page, pageSize, selectedTags, sortBy, debouncedSearch]);

  const handleTagClick = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
    setPage(1);
  };

  const handleSortChange = (value: string | null) => {
    if (value) {
      setSortBy(value);
      setPage(1);
    }
  };

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <LogRowSkeleton key={index} />
    ));
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await dispatch(deleteLog(id)).unwrap();
      notifications.show({
        title: 'Success',
        message: 'Log deleted successfully',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to delete log',
        color: 'red',
      });
    }
  };

  const handleEditLog = (log: Log) => {
    navigate(`/logs/edit/${log._id}`);
  };

  const logsToDisplay: Log[] = logs.map(log => ({
    ...log,
    tags: log.tags || [],
    mediaUrls: log.mediaUrls || []
  }));

  return (
    <>
      <UserSidebar />
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
          <Paper shadow="xs" p="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between" wrap="wrap" gap="md">
                <Title order={2}>Your Logs</Title>

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

              <Stack gap="xs">
                <Text fw={500}>Tags:</Text>
                <Group gap="xs" wrap="wrap">
                  {tags.map((tag) => (
                    <Chip
                      key={tag._id}
                      checked={selectedTags.includes(tag._id)}
                      onChange={() => handleTagClick(tag._id)}
                      size="sm"
                      variant="light"
                      color="blue"
                    >
                      {tag.name}
                    </Chip>
                  ))}
                </Group>
              </Stack>
              <TextInput
                placeholder="Search logs"
                leftSection={<IconSearch size={16} />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.currentTarget.value)}
                style={{ width: '100%', maxWidth: isMobile ? '100%' : '400px' }}
                size="md"
              />
            </Stack>
          </Paper>

          <Stack gap="md">
            {loading && page === 1 ? (
              renderSkeletons()
            ) : logsToDisplay.length > 0 ? (
              logsToDisplay.map((log) => (
                <LogRow 
                  key={log._id} 
                  log={log} 
                  onEdit={() => handleEditLog(log)} 
                  onDelete={() => handleDeleteLog(log._id)}
                />
              ))
            ) : (
              <Center py="xl">
                <Text c="dimmed" size="sm">No logs found</Text>
              </Center>
            )}

            {!loading && logsToDisplay.length > 0 && ( 
              <Stack gap="md" mt="md">
                <Group justify="space-between" wrap="wrap" gap="md">
                  <Select
                    label="Logs per page"
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
          <CreateButton onClick={() => navigate('/logs/create')} />
        </Box>
      </Box>
    </>
  );
} 