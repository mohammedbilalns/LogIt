import { Box, Group, Stack, Text, Title, Select, Chip, Center, Modal, Button } from '@mantine/core';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchLogs, deleteLog, Log } from '@slices/logSlice';
import { fetchTags } from '@slices/tagSlice';
import LogRow from '@components/log/LogRow';
import LogRowSkeleton from '@components/log/LogRowSkeleton';
import { useMediaQuery, useDebouncedValue } from '@mantine/hooks';
import CreateButton from '@components/CreateButton';
import { notifications } from '@mantine/notifications';
import UserSidebar from '@components/user/UserSidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LogFilters {
  tagIds: string[];
}

export default function LogsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedTags] = useState<string[]>([]);
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

  const handleDeleteLog = (id: string) => {
    setLogToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!logToDelete) {
      return;
    }
    
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
            {loading && page === 1 ? (
              renderSkeletons()
            ) : logsToDisplay.length > 0 ? (
              <>
                {logsToDisplay.map((log) => (
                  <LogRow 
                    key={log._id} 
                    log={log} 
                    onEdit={() => handleEditLog(log)} 
                    onDelete={handleDeleteLog}
                  />
                ))}
                <div ref={observerTarget} style={{ height: '20px', width: '100%' }} />
                {loading && page > 1 && renderSkeletons()}
              </>
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
        onClose={() => {
          setDeleteModalOpen(false);
          setLogToDelete(null);
        }}
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
            <Button variant="default" onClick={() => {
              setDeleteModalOpen(false);
              setLogToDelete(null);
            }}>
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