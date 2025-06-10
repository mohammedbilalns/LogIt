import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Title,
  TextInput,
  Table,
  Group,
  Text,
  Badge,
  Paper,
  Loader,
  Stack,
  Box,
  ActionIcon,
  Tooltip,
  ScrollArea,
  useMantineTheme,
  useMantineColorScheme,
  Pagination,
  Select,
  Button,
  Center,
} from '@mantine/core';
import { IconSearch, IconArticle } from '@tabler/icons-react';
import { AppDispatch, RootState } from '@/store';
import { fetchReports, updateReportStatus, blockArticle, Report } from '@/store/slices/reportSlice';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

export default function ReportsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const { reports = [], loading, error, totalPages } = useSelector(
    (state: RootState) => state.report
  );

  useEffect(() => {
    dispatch(fetchReports({ 
      page, 
      limit: pageSize, 
      search: debouncedSearch, 
      status: filterStatus === 'all' ? undefined : filterStatus 
    }));
  }, [debouncedSearch, page, pageSize, filterStatus, dispatch]);

  const handleUpdateStatus = async (reportId: string, status: 'reviewed' | 'resolved') => {
    try {
      await dispatch(updateReportStatus({ id: reportId, status })).unwrap();
      notifications.show({
        title: 'Success',
        message: `Report status updated to ${status}`,
        color: 'green',
      });
      // Refresh reports after updating status
      dispatch(fetchReports({ 
        page, 
        limit: pageSize, 
        search: debouncedSearch, 
        status: filterStatus === 'all' ? undefined : filterStatus 
      }));
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update report status',
        color: 'red',
      });
    }
  };

  const handleBlockArticle = async (articleId: string) => {
    try {
      await dispatch(blockArticle(articleId)).unwrap();
      notifications.show({
        title: 'Success',
        message: 'Article blocked successfully',
        color: 'green',
      });
      // Refresh reports after blocking article
      dispatch(fetchReports({ 
        page, 
        limit: pageSize, 
        search: debouncedSearch, 
        status: filterStatus === 'all' ? undefined : filterStatus 
      }));
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to block article',
        color: 'red',
      });
    }
  };

  const handleViewArticle = (articleId: string) => {
    // Navigate to the article page with admin context
    navigate(`/admin/articles/${articleId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const containerPadding = isMobile ? "md" : "xl";

  return (
    <Container
      size="xl"
      py="xl"
      px={containerPadding}
      style={{
        marginLeft: isOpen && !isMobile ? '200px' : '0px',
        transition: 'margin-left 0.3s ease',
        width: isOpen && !isMobile ? 'calc(100% - 200px)' : '100%',
        maxWidth: '100%',
        ...(isMobile && {
          marginLeft: '0',
          width: '100%',
          padding: '1rem',
          maxWidth: '100%',
        }),
      }}
    >
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
            <Title order={2} fw={600}>Reports Management</Title>
            <Group grow wrap="wrap">
              <TextInput
                placeholder="Search reports by reason or reported by email"
                leftSection={<IconSearch size={16} />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.currentTarget.value)}
                style={{ flexGrow: 1 }}
                size="md"
              />
              <Select
                label="Status Filter"
                value={filterStatus}
                onChange={(value) => setFilterStatus(value as 'all' | 'pending' | 'reviewed' | 'resolved')}
                data={[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'reviewed', label: 'Reviewed' },
                  { value: 'resolved', label: 'Resolved' },
                ]}
                style={{ width: isTablet ? '100%' : '200px' }}
                size="md"
              />
            </Group>
          </Stack>
        </Paper>

        <Paper shadow="xs" p="md" withBorder>
          <ScrollArea>
            <Box style={{
              minWidth: isMobile ? 800 : 1000,
              ['@media (max-width: 768px)']: {
                minWidth: 800,
              }
            }}>
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: isMobile ? '120px' : '150px' }}>Reported By</Table.Th>
                    <Table.Th style={{ width: isMobile ? '180px' : '250px' }}>Reason</Table.Th>
                    <Table.Th style={{ width: isMobile ? '100px' : '120px' }}>Status</Table.Th>
                    <Table.Th style={{ width: isMobile ? '180px' : '250px' }}>Target</Table.Th>
                    <Table.Th style={{ width: isMobile ? '180px' : '250px' }}>Actions</Table.Th>
                    <Table.Th style={{ width: isMobile ? '160px' : '200px' }}>Created At</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {reports.map((report: Report) => (
                    <Table.Tr key={report._id}>
                      <Table.Td>
                        <Text size={isMobile ? "sm" : "md"} fw={500}>{report.reportedBy.name}</Text>
                        <Text size={isMobile ? "xs" : "sm"} c="dimmed">{report.reportedBy.email}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size={isMobile ? "sm" : "md"}>{report.reason}</Text>
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
                          size={isMobile ? "sm" : "md"}
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
                                size={isMobile ? "sm" : "md"}
                              >
                                <IconArticle size={isMobile ? 16 : 18} />
                              </ActionIcon>
                            </Tooltip>
                            {report.status !== 'resolved' && report.status !== 'blocked' && (
                              <Button
                                variant="outline"
                                color="red"
                                size={isMobile ? "xs" : "sm"}
                                onClick={() => handleBlockArticle(report.targetId)}
                              >
                                Block Article
                              </Button>
                            )}
                          </Group>
                        ) : (
                          <Text size={isMobile ? "sm" : "md"}>User ID: {report.targetId}</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {(report.status === 'pending' || report.status === 'reviewed') && (
                          <Group gap="xs" wrap="nowrap">
                            {report.status === 'pending' && (
                              <Button
                                variant="light"
                                color="green"
                                size={isMobile ? "xs" : "sm"}
                                onClick={() => handleUpdateStatus(report._id, 'reviewed')}
                              >
                                Mark Reviewed
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              color="gray"
                              size={isMobile ? "xs" : "sm"}
                              onClick={() => handleUpdateStatus(report._id, 'resolved')}
                            >
                              Dismiss
                            </Button>
                          </Group>
                        )}
                        {report.status === 'blocked' && (
                          <Text size={isMobile ? "sm" : "md"} c="red">Article Blocked</Text>
                        )}
                        {report.status === 'resolved' && (
                          <Text size={isMobile ? "sm" : "md"} c="dimmed">No actions available</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size={isMobile ? "sm" : "md"} c="dimmed">
                          {formatDate(report.createdAt)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </ScrollArea>

          {loading && (
            <Box 
              style={{ 
                padding: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderTop: '1px solid var(--mantine-color-gray-3)'
              }}
            >
              <Stack align="center" gap="xs">
                <Loader size="md" />
                <Text size="sm" c="dimmed">Loading reports...</Text>
              </Stack>
            </Box>
          )}
          
          {error && (
            <Box 
              style={{ 
                padding: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderTop: '1px solid var(--mantine-color-gray-3)'
              }}
            >
              <Text c="red" size="sm">{error}</Text>
            </Box>
          )}

          {!loading && !error && reports.length === 0 && (
            <Box 
              style={{ 
                padding: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderTop: '1px solid var(--mantine-color-gray-3)'
              }}
            >
              <Text c="dimmed" size="sm">No reports found</Text>
            </Box>
          )}

          {!loading && !error && reports.length > 0 && (
            <Stack gap="md" mt="md" px={isMobile ? "sm" : "md"}>
              <Group justify="space-between" wrap="wrap" gap="md">
                <Select
                  label="Reports per page"
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
                  total={totalPages}
                  value={page}
                  onChange={setPage}
                  withEdges
                  size={isMobile ? 'sm' : 'md'}
                />
              </Group>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
} 