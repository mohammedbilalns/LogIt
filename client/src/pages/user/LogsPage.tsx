import { Box, Group, Stack, Text, Title, Select, Chip, Center, Modal, Button, Paper } from '@mantine/core';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchLogs, deleteLog, Log } from '@slices/logSlice';
import { fetchPromotedAndUserTags } from '@slices/tagSlice';
import LogRow from '@components/log/LogRow';
import LogRowSkeleton from '@/components/skeletons/LogRowSkeleton';
import { useMediaQuery, useDebouncedValue } from '@mantine/hooks';
import CreateButton from '@/components/user/CreateButton';
import { notifications } from '@mantine/notifications';
import UserSidebar from '@components/user/UserSidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TagSearchSelector from '@/components/tags/TagSearchSelector';

interface LogFilters {
  tagIds: string[];
}

export default function LogsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('new');
  const [searchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 500);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { logs, loading, hasMore } = useSelector((state: RootState) => state.logs);
  const { tags } = useSelector((state: RootState) => state.tags);
  const userId = useSelector((state: RootState) => state.auth.user?._id);

  const filters = useMemo(() => ({
    tagIds: [...selectedTags, ...searchTags],
  }), [selectedTags, searchTags]);

  const logsToDisplay = useMemo(() => 
    logs.map(log => ({
      ...log,
      tags: log.tags || [],
      mediaUrls: log.mediaUrls || []
    })),
    [logs]
  );

  const sortOptions = useMemo(() => [
    { value: 'new', label: 'New To Old' },
    { value: 'old', label: 'Old To New' },
  ], []);

  const skeletons = useMemo(() => 
    Array(3).fill(0).map((_, index) => (
      <LogRowSkeleton key={index} />
    )),
  []);

  useEffect(() => {
    dispatch(fetchPromotedAndUserTags({ limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchLogs({
      page,
      limit: pageSize,
      search: debouncedSearch,
      sortBy: sortBy === 'new' ? 'createdAt' : 'createdAt',
      sortOrder: sortBy === 'old' ? 'asc' : 'desc',
      filters: JSON.stringify(filters)
    }));
  }, [dispatch, page, pageSize, filters, sortBy, debouncedSearch]);

  useEffect(() => {
    const currentObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
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
  }, [hasMore, loading]);

  const handleSortChange = useCallback((value: string | null) => {
    if (value) {
      setSortBy(value);
      setPage(1);
    }
  }, []);

  const handleDeleteLog = useCallback((id: string) => {
    setLogToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!logToDelete) return;
    
    try {
      await dispatch(deleteLog(logToDelete)).unwrap();
      notifications.show({
        title: 'Success',
        message: 'Log deleted successfully',
        color: 'green',
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || error.message,
          color: 'red',
        });
      } else if (error instanceof Error) {
        notifications.show({
          title: 'Error',
          message: error.message,
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete log',
          color: 'red',
        });
      }
    } finally {
      setDeleteModalOpen(false);
      setLogToDelete(null);
    }
  }, [dispatch, logToDelete]);

  const handleEditLog = useCallback((log: Log) => {
    navigate(`/logs/edit/${log._id}`);
  }, [navigate]);

  const handleTagChange = useCallback((tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTags(prev => [...prev, tagId]);
    } else {
      setSelectedTags(prev => prev.filter(id => id !== tagId));
    }
  }, []);

  return (
    <>
      <UserSidebar isModalOpen={deleteModalOpen} />
      <Box 
        className={`page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`}
      >
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Title order={2}>Your Logs</Title>

            <Group>
              <Text fw={500}>Sort By:</Text>
              <Select
                data={sortOptions}
                value={sortBy}
                onChange={handleSortChange}
                size="xs"
                radius="md"
                checkIconPosition="right"
              />
            </Group>
          </Group>

          <Paper withBorder p="md" radius="md">
            <Stack gap="md">
              <Stack gap="xs">
                <Text fw={500}>Quick Select Tags:</Text>
                <Group gap="xs" wrap="wrap">
                  {tags.map((tag) => (
                    <Chip
                      key={tag._id}
                      checked={selectedTags.includes(tag._id)}
                      onChange={(checked) => handleTagChange(tag._id, checked)}
                      size="sm"
                      variant="light"
                      color="blue"
                    >
                      {tag.name}
                    </Chip>
                  ))}
                </Group>
              </Stack>

              <TagSearchSelector
                label="Search Additional Tags"
                description="Search and select more tags to filter logs"
                value={searchTags}
                onChange={setSearchTags}
              />
            </Stack>
          </Paper>

          <Stack gap="md">
            {logsToDisplay.length > 0 ? (
              <>
                {logsToDisplay.map((log) => (
                  <LogRow 
                    key={log._id} 
                    log={log}
                    onEdit={() => handleEditLog(log)}
                    onDelete={() => handleDeleteLog(log._id)}
                  />
                ))}
                <div ref={observerTarget} style={{ height: '20px', width: '100%' }} />
                {loading && page > 1 && skeletons}
              </>
            ) : loading ? (
              skeletons
            ) : (
              <Center py="xl">
                <Text c="dimmed" size="sm">No logs found</Text>
              </Center>
            )}
          </Stack>
        </Stack>

        <Box pos="fixed" bottom={24} right={24}>
          <CreateButton onClick={() => navigate('/logs/create')} />
        </Box>
      </Box>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Log"
        centered
        zIndex={2000}
        styles={{
          overlay: {
            zIndex: 2000
          },
          content: {
            zIndex: 2001
          }
        }}
      >
        <Stack>
          <Text>Are you sure you want to delete this log? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
} 