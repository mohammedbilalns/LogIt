import { useEffect, useState } from 'react';
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
  Avatar,
  Stack,
  Box,
  ActionIcon,
  Tooltip,
  ScrollArea,
  useMantineTheme,
  useMantineColorScheme,
  Pagination,
  Select,
} from '@mantine/core';
import { IconSearch, IconLock, IconLockOpen } from '@tabler/icons-react';
import { AppDispatch, RootState } from '@/store';
import { fetchUsers, setSearchQuery, blockUser, unblockUser, UserManagementState } from '@slices/userManagementSlice';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

export default function UserManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const { users, loading, error, totalPages } = useSelector(
    (state: RootState) => state.userManagement as UserManagementState
  );

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await dispatch(unblockUser(userId)).unwrap();
        notifications.show({
          title: 'Success',
          message: 'User has been unblocked',
          color: 'green',
        });
      } else {
        await dispatch(blockUser(userId)).unwrap();
        notifications.show({
          title: 'Success',
          message: 'User has been blocked',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update user status',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch));
    dispatch(fetchUsers({ page, limit: pageSize, search: debouncedSearch }));
  }, [debouncedSearch, page, pageSize, dispatch]);

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
            <Title order={2} fw={600}>User Management</Title>
            <TextInput
              placeholder="Search users by name or email"
              leftSection={<IconSearch size={16} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
              style={{ width: '100%', maxWidth: isTablet ? '100%' : '400px' }}
              size="md"
            />
          </Stack>
        </Paper>

        <Paper shadow="xs" p="md" withBorder>
          <ScrollArea>
            <Box style={{
              minWidth: isMobile ? 650 : 800,
              ['@media (max-width: 768px)'] : {
                 minWidth: 650,
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
                    <Table.Th style={{ width: isMobile ? '60px' : '70px' }}>Image</Table.Th>
                    <Table.Th style={{ width: isMobile ? '140px' : '180px' }}>Name</Table.Th>
                    <Table.Th style={{ width: isMobile ? '180px' : '220px' }}>Email</Table.Th>
                    <Table.Th style={{ width: isMobile ? '120px' : '150px' }}>Profession</Table.Th>
                    <Table.Th style={{ width: isMobile ? '90px' : '100px' }}>Provider</Table.Th>
                    <Table.Th style={{ width: isMobile ? '90px' : '100px' }}>Status</Table.Th>
                    <Table.Th style={{ width: isMobile ? '100px' : '120px' }}>Joined</Table.Th>
                    <Table.Th style={{ width: isMobile ? '80px' : '100px' }}>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((user) => (
                    <Table.Tr key={user._id}>
                      <Table.Td>
                        <Avatar
                          src={user.profileImage}
                          alt={user.name}
                          size={isMobile ? "md" : "lg"}
                          radius="xl"
                        />
                      </Table.Td>
                      <Table.Td>
                        <Text size={isMobile ? "sm" : "md"} fw={500} lineClamp={1}>
                          {user.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size={isMobile ? "sm" : "md"} c="dimmed" lineClamp={1}>
                          {user.email}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size={isMobile ? "sm" : "md"} lineClamp={1}>
                          {user.profession || 'Not specified'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          variant="light"
                          color={user.provider === 'google' ? 'blue' : 'gray'}
                          size={isMobile ? "md" : "lg"}
                        >
                          {user.provider}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={user.isBlocked ? 'red' : 'green'}
                          variant="light"
                          size={isMobile ? "md" : "lg"}
                        >
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size={isMobile ? "sm" : "md"} c="dimmed">
                          {formatDate(user.createdAt)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Tooltip label={user.isBlocked ? 'Unblock User' : 'Block User'}>
                          <ActionIcon
                            variant="subtle"
                            color={user.isBlocked ? 'green' : 'red'}
                            onClick={() => handleBlockUser(user._id, user.isBlocked)}
                            size={isMobile ? "sm" : "md"}
                          >
                            {user.isBlocked ? <IconLockOpen size={18} /> : <IconLock size={18} />}
                          </ActionIcon>
                        </Tooltip>
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
                <Text size="sm" c="dimmed">Loading users...</Text>
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

          {!loading && !error && users.length === 0 && (
            <Box 
              style={{ 
                padding: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderTop: '1px solid var(--mantine-color-gray-3)'
              }}
            >
              <Text c="dimmed" size="sm">No users found</Text>
            </Box>
          )}

          {!loading && !error && users.length > 0 && (
            <Stack gap="md" mt="md" px={isMobile ? "sm" : "md"}>
              <Group justify="space-between" wrap="wrap" gap="md">
                <Select
                  label="Page size"
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