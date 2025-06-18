import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Group,
  Text,
  Badge,
  Paper,
  Avatar,
  Stack,
  ActionIcon,
  Tooltip,
  ScrollArea,
  useMantineTheme,
  useMantineColorScheme,
  Card,
  Divider,
} from '@mantine/core';
import { IconLock, IconLockOpen, IconMail, IconUser, IconCalendar, IconBriefcase } from '@tabler/icons-react';
import { AppDispatch, RootState } from '@/store';
import { fetchUsers, setSearchQuery, blockUser, unblockUser } from '@slices/userManagementSlice';
import { UserManagementState } from '@/types/user-management.types';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { ConfirmModal } from '@/components/confirm';
import AdminPageContainer from '@/components/admin/AdminPageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ResponsivePagination from '@/components/admin/ResponsivePagination';
import LoadingState from '@/components/admin/LoadingState';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';

export default function UserManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{ id: string; isBlocked: boolean } | null>(null);

  const { users, loading, error, totalPages } = useSelector(
    (state: RootState) => state.userManagement as UserManagementState
  );

  const handleBlockUser = useCallback(async (userId: string, isBlocked: boolean) => {
    setUserToBlock({ id: userId, isBlocked });
    setBlockModalOpen(true);
  }, []);

  const handleBlockConfirm = useCallback(async () => {
    if (!userToBlock) return;

    try {
      if (userToBlock.isBlocked) {
        await dispatch(unblockUser(userToBlock.id)).unwrap();
        notifications.show({
          title: 'Success',
          message: 'User has been unblocked',
          color: 'green',
        });
      } else {
        await dispatch(blockUser(userToBlock.id)).unwrap();
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
    } finally {
      setBlockModalOpen(false);
      setUserToBlock(null);
    }
  }, [dispatch, userToBlock]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.currentTarget.value);
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

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const fetchParams = useMemo(() => ({
    page,
    limit: pageSize,
    search: debouncedSearch
  }), [page, pageSize, debouncedSearch]);

  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch));
    setPage(1);
  }, [dispatch, debouncedSearch]);

  useEffect(() => {
    dispatch(fetchUsers(fetchParams));
  }, [dispatch, fetchParams]);

  // Mobile card view
  const renderMobileUserCard = (user: any) => (
    <Card key={user._id} shadow="xs" p="md" withBorder mb="sm">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Avatar
              src={user.profileImage}
              alt={user.name}
              size="lg"
              radius="xl"
            />
            <Stack gap={4}>
              <Text fw={600} size="sm" lineClamp={1}>
                {user.name}
              </Text>
              <Group gap="xs">
                <IconMail size={14} />
                <Text size="xs" c="dimmed" lineClamp={1} style={{ maxWidth: '150px' }}>
                  {user.email}
                </Text>
              </Group>
            </Stack>
          </Group>
          <Tooltip label={user.isBlocked ? 'Unblock User' : 'Block User'}>
            <ActionIcon
              onClick={() => handleBlockUser(user._id, user.isBlocked)}
              color={user.isBlocked ? 'green' : 'red'}
              variant="light"
              size="sm"
            >
              {user.isBlocked ? <IconLockOpen size={16} /> : <IconLock size={16} />}
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider />

        <Group gap="lg" wrap="wrap">
          <Group gap="xs">
            <IconBriefcase size={14} />
            <Text size="xs" c="dimmed">
              {user.profession || 'Not specified'}
            </Text>
          </Group>

          <Group gap="xs">
            <IconUser size={14} />
            <Badge
              variant="light"
              color={user.provider === 'google' ? 'blue' : 'gray'}
              size="xs"
            >
              {user.provider}
            </Badge>
          </Group>

          <Group gap="xs">
            <IconCalendar size={14} />
            <Text size="xs" c="dimmed">
              {formatDate(user.createdAt)}
            </Text>
          </Group>
        </Group>

        <Group justify="flex-end">
          <Badge
            color={user.isBlocked ? 'red' : 'green'}
            variant="light"
            size="sm"
          >
            {user.isBlocked ? 'Blocked' : 'Active'}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );

  return (
    <AdminPageContainer>
      <Stack gap="lg">
        <AdminPageHeader
          title="User Management"
          searchPlaceholder="Search users by name or email"
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
        />

        <Paper shadow="xs" p="md" withBorder>
          {isMobile ? (
            // Mobile card view
            <Stack gap="md">
              {users.map(renderMobileUserCard)}

              {loading && <LoadingState message="Loading users..." showBorder={false} />}
              {error && <ErrorState message={error} showBorder={false} />}
              {!loading && !error && users.length === 0 && (
                <EmptyState message="No users found" showBorder={false} />
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
                      <Table.Th style={{ width: '70px' }}>Image</Table.Th>
                      <Table.Th style={{ width: '180px' }}>Name</Table.Th>
                      <Table.Th style={{ width: '220px' }}>Email</Table.Th>
                      <Table.Th style={{ width: '150px' }}>Profession</Table.Th>
                      <Table.Th style={{ width: '100px' }}>Provider</Table.Th>
                      <Table.Th style={{ width: '100px' }}>Status</Table.Th>
                      <Table.Th style={{ width: '120px' }}>Joined</Table.Th>
                      <Table.Th style={{ width: '100px' }}>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {users.map((user) => (
                      <Table.Tr key={user._id}>
                        <Table.Td>
                          <Avatar
                            src={user.profileImage}
                            alt={user.name}
                            size="lg"
                            radius="xl"
                          />
                        </Table.Td>
                        <Table.Td>
                          <Text size="md" fw={500} lineClamp={1}>
                            {user.name}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="md" c="dimmed" lineClamp={1}>
                            {user.email}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="md" lineClamp={1}>
                            {user.profession || 'Not specified'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            variant="light"
                            color={user.provider === 'google' ? 'blue' : 'gray'}
                            size="lg"
                          >
                            {user.provider}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={user.isBlocked ? 'red' : 'green'}
                            variant="light"
                            size="lg"
                          >
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="md" c="dimmed">
                            {formatDate(user.createdAt)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Tooltip label={user.isBlocked ? 'Unblock User' : 'Block User'}>
                            <ActionIcon
                              onClick={() => handleBlockUser(user._id, user.isBlocked)}
                              color={user.isBlocked ? 'green' : 'red'}
                              variant="light"
                            >
                              {user.isBlocked ? <IconLockOpen size={16} /> : <IconLock size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              {loading && <LoadingState message="Loading users..." />}
              {error && <ErrorState message={error} />}
              {!loading && !error && users.length === 0 && (
                <EmptyState message="No users found" />
              )}
            </>
          )}

          {!loading && !error && users.length > 0 && (
            <ResponsivePagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </Paper>
      </Stack>

      <ConfirmModal
        opened={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setUserToBlock(null);
        }}
        onConfirm={handleBlockConfirm}
        title={userToBlock?.isBlocked ? "Unblock User" : "Block User"}
        message={`Are you sure you want to ${userToBlock?.isBlocked ? 'unblock' : 'block'} this user?`}
        confirmLabel={userToBlock?.isBlocked ? "Unblock" : "Block"}
        confirmColor={userToBlock?.isBlocked ? "green" : "red"}
        loading={loading}
      />
    </AdminPageContainer>
  );
} 