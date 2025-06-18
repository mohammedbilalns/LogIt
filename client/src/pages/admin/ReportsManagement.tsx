import  { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Group,
  Text,
  Badge,
  Paper,
  Stack,
  ActionIcon,
  Tooltip,
  ScrollArea,
  useMantineTheme,
  useMantineColorScheme,
  Button,
  Card,
  Divider,
  Select,
} from '@mantine/core';
import { IconArticle, IconUser, IconCalendar, IconFlag } from '@tabler/icons-react';
import { AppDispatch, RootState } from '@/store';
import { fetchReports, updateReportStatus, blockArticle } from '@/store/slices/reportSlice';
import { Report } from '@/types/report.types';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '@/components/confirm';
import AdminPageContainer from '@/components/admin/AdminPageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ResponsivePagination from '@/components/admin/ResponsivePagination';
import LoadingState from '@/components/admin/LoadingState';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';

export default function ReportsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [articleToBlock, setArticleToBlock] = useState<string | null>(null);

  const { reports = [], loading, error, totalPages } = useSelector(
    (state: RootState) => state.report
  );

  const handleUpdateStatus = useCallback(async (reportId: string, status: 'reviewed' | 'resolved') => {
    try {
      await dispatch(updateReportStatus({ id: reportId, status })).unwrap();
      notifications.show({
        title: 'Success',
        message: `Report status updated to ${status}`,
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update report status',
        color: 'red',
      });
    }
  }, [dispatch]);

  const handleBlockArticle = useCallback((articleId: string) => {
    setArticleToBlock(articleId);
    setBlockModalOpen(true);
  }, []);

  const handleBlockConfirm = useCallback(async () => {
    if (!articleToBlock) return;
    
    try {
      await dispatch(blockArticle(articleToBlock)).unwrap();
      notifications.show({
        title: 'Success',
        message: 'Article blocked successfully',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to block article',
        color: 'red',
      });
    } finally {
      setBlockModalOpen(false);
      setArticleToBlock(null);
    }
  }, [dispatch, articleToBlock]);

  const handleViewArticle = useCallback((articleId: string) => {
    navigate(`/admin/articles/${articleId}`);
  }, [navigate]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.currentTarget.value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string | null) => {
    if (value) {
      setFilterStatus(value as 'all' | 'pending' | 'reviewed' | 'resolved');
    }
  }, []);

  const handlePageSizeChange = useCallback((value: string | null) => {
    if (value) {
      setPageSize(Number(value));
      setPage(1);
    }
  }, []);

  const handlePageChange = useCallback((value: number) => {
    setPage(value);
  }, []);

  const fetchParams = useMemo(() => ({
    page,
    limit: pageSize,
    search: debouncedSearch,
    status: filterStatus === 'all' ? undefined : filterStatus
  }), [page, pageSize, debouncedSearch, filterStatus]);

  useEffect(() => {
    dispatch(fetchReports(fetchParams));
  }, [dispatch, fetchParams]);

  // Mobile card view for reports
  const renderMobileReportCard = (report: Report) => (
    <Card key={report.id} shadow="xs" p="md" withBorder mb="sm">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Group gap="xs">
              <IconUser size={14} />
              <Text fw={600} size="sm">
                {report.reportedBy.name}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {report.reportedBy.email}
            </Text>
          </Stack>
          <Badge
            color={
              report.status === 'pending' ? 'yellow' 
              : report.status === 'reviewed' ? 'blue' 
              : report.status === 'blocked' ? 'red'
              : 'green'
            }
            variant="light"
            size="sm"
          >
            {report.status}
          </Badge>
        </Group>
        
        <Divider />
        
        <Stack gap="xs">
          <Group gap="xs">
            <IconFlag size={14} />
            <Text size="sm" fw={500}>Reason:</Text>
          </Group>
          <Text size="sm" c="dimmed">
            {report.reason}
          </Text>
        </Stack>
        
        <Group gap="xs">
          <IconCalendar size={14} />
          <Text size="xs" c="dimmed">
            {formatDate(report.createdAt)}
          </Text>
        </Group>
        
        {report.targetType === 'article' && (
          <Group gap="xs">
            <IconArticle size={14} />
            <Text size="sm" fw={500}>Target: Article</Text>
          </Group>
        )}
        
        <Stack gap="xs">
          <Group gap="xs" wrap="wrap">
            {report.targetType === 'article' && (
              <>
                <Button
                  variant="subtle"
                  color="blue"
                  size="xs"
                  leftSection={<IconArticle size={14} />}
                  onClick={() => handleViewArticle(report.targetId)}
                >
                  View Article
                </Button>
                {report.status !== 'resolved' && report.status !== 'blocked' && (
                  <Button
                    variant="outline"
                    color="red"
                    size="xs"
                    onClick={() => handleBlockArticle(report.targetId)}
                  >
                    Block Article
                  </Button>
                )}
              </>
            )}
          </Group>
          
          {(report.status === 'pending' || report.status === 'reviewed') && (
            <Group gap="xs" wrap="wrap">
              {report.status === 'pending' && (
                <Button
                  variant="light"
                  color="green"
                  size="xs"
                  onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                >
                  Mark Reviewed
                </Button>
              )}
              <Button
                variant="outline"
                color="gray"
                size="xs"
                onClick={() => handleUpdateStatus(report.id, 'resolved')}
              >
                Dismiss
              </Button>
            </Group>
          )}
          
          {report.status === 'blocked' && (
            <Text size="sm" c="red">Article Blocked</Text>
          )}
          
          {report.status === 'resolved' && (
            <Text size="sm" c="dimmed">No actions available</Text>
          )}
        </Stack>
      </Stack>
    </Card>
  );

  const statusFilterSelect = (
    <Select
      label="Status Filter"
      value={filterStatus}
      onChange={handleStatusFilterChange}
      data={[
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'resolved', label: 'Resolved' },
      ]}
      style={{ width: '200px' }}
      size="md"
    />
  );

  return (
    <AdminPageContainer>
      <Stack gap="lg">
        <AdminPageHeader
          title="Reports Management"
          searchPlaceholder="Search reports by reason or reported by email"
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          searchMaxWidth="300px"
          additionalFilters={statusFilterSelect}
        />

        <Paper shadow="xs" p="md" withBorder>
          {isMobile ? (
            // Mobile card view
            <Stack gap="md">
              {reports.map(renderMobileReportCard)}
              
              {loading && <LoadingState message="Loading reports..." showBorder={false} />}
              {error && <ErrorState message={error} showBorder={false} />}
              {!loading && !error && reports.length === 0 && (
                <EmptyState message="No reports found" showBorder={false} />
              )}
            </Stack>
          ) : (
            // Desktop table view
            <>
              <ScrollArea>
                <Table
                  striped
                  highlightOnHover
                  withTableBorder
                  withColumnBorders
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: '150px' }}>Reported By</Table.Th>
                      <Table.Th style={{ width: '250px' }}>Reason</Table.Th>
                      <Table.Th style={{ width: '120px' }}>Status</Table.Th>
                      <Table.Th style={{ width: '250px' }}>Target</Table.Th>
                      <Table.Th style={{ width: '250px' }}>Actions</Table.Th>
                      <Table.Th style={{ width: '200px' }}>Created At</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {reports.map((report: Report) => (
                      <Table.Tr key={report.id}>
                        <Table.Td>
                          <Text size="md" fw={500}>{report.reportedBy.name}</Text>
                          <Text size="sm" c="dimmed">{report.reportedBy.email}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="md">{report.reason}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              report.status === 'pending' ? 'yellow' 
                              : report.status === 'reviewed' ? 'blue' 
                              : report.status === 'blocked' ? 'red'
                              : 'green'
                            }
                            variant="light"
                            size="md"
                          >
                            {report.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {report.targetType === 'article' ? (
                            <Group gap="xs">
                              <Tooltip label="View Article">
                                <ActionIcon 
                                  variant="subtle" 
                                  color="blue" 
                                  onClick={() => handleViewArticle(report.targetId)} 
                                  size="md"
                                >
                                  <IconArticle size={18} />
                                </ActionIcon>
                              </Tooltip>
                              {report.status !== 'resolved' && report.status !== 'blocked' && (
                                <Button
                                  variant="outline"
                                  color="red"
                                  size="sm"
                                  onClick={() => handleBlockArticle(report.targetId)}
                                >
                                  Block Article
                                </Button>
                              )}
                            </Group>
                          ) : (
                            <Text size="md">User ID: {report.targetId}</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {(report.status === 'pending' || report.status === 'reviewed') && (
                            <Group gap="xs" wrap="nowrap">
                              {report.status === 'pending' && (
                                <Button
                                  variant="light"
                                  color="green"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                                >
                                  Mark Reviewed
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                color="gray"
                                size="sm"
                                onClick={() => handleUpdateStatus(report.id, 'resolved')}
                              >
                                Dismiss
                              </Button>
                            </Group>
                          )}
                          {report.status === 'blocked' && (
                            <Text size="md" c="red">Article Blocked</Text>
                          )}
                          {report.status === 'resolved' && (
                            <Text size="md" c="dimmed">No actions available</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Text size="md" c="dimmed">
                            {formatDate(report.createdAt)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              {loading && <LoadingState message="Loading reports..." />}
              {error && <ErrorState message={error} />}
              {!loading && !error && reports.length === 0 && (
                <EmptyState message="No reports found" />
              )}
            </>
          )}

          {!loading && !error && reports.length > 0 && (
            <ResponsivePagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              label="Reports per page"
              placeholder="Reports per page"
            />
          )}
        </Paper>
      </Stack>

      <ConfirmModal
        opened={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setArticleToBlock(null);
        }}
        onConfirm={handleBlockConfirm}
        title="Block Article"
        message="Are you sure you want to block this article? This action cannot be undone."
        confirmLabel="Block"
        confirmColor="red"
        loading={loading}
      />
    </AdminPageContainer>
  );
} 