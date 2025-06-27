import {
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  Avatar,
  Checkbox,
  ScrollArea,
  Loader,
  Box,
  ActionIcon,
} from '@mantine/core';
import { useState, useEffect, useRef } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersPaginated, clearPaginatedUsers } from '@/store/slices/userManagementSlice';
import { RootState, AppDispatch } from '@/store';
import { SearchIcon } from '../icons/SearchIcon';
import { XIcon } from '../icons/XIcon';

export interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface UserSearchListProps {
  opened: boolean;
  selectedUsers: string[];
  setSelectedUsers: (ids: string[]) => void;
  maxSelected?: number;
  excludeIds?: string[];
  label?: string;
}

export default function UserSearchList({
  opened,
  selectedUsers,
  setSelectedUsers,
  maxSelected = 9,
  excludeIds = [],
  label = 'Select Users',
}: UserSearchListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.userManagement.paginatedUsers);
  const loadingUsers = useSelector((state: RootState) => state.userManagement.paginatedUsersLoading);
  const hasMore = useSelector((state: RootState) => state.userManagement.paginatedUsersHasMore);
  const page = useSelector((state: RootState) => state.userManagement.paginatedUsersPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);
  const isInitialLoad = useRef(true);
  const [allSelectedUsers, setAllSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    const selectedUserObjects = users.filter(user => selectedUsers.includes(user._id));
    setAllSelectedUsers(prev => {
      const existingSelected = prev.filter(user => !users.some(u => u._id === user._id));
      return [...existingSelected, ...selectedUserObjects];
    });
  }, [selectedUsers, users]);

  useEffect(() => {
    if (opened) {
      dispatch(clearPaginatedUsers());
      dispatch(fetchUsersPaginated({ page: 1, search: '' }));
      setAllSelectedUsers([]);
      setSearchQuery('');
      isInitialLoad.current = true;
    }
  }, [opened, dispatch]);

  useEffect(() => {
    if (opened && !isInitialLoad.current) {
      dispatch(clearPaginatedUsers());
      dispatch(fetchUsersPaginated({ page: 1, search: debouncedSearch }));
    }
    if (opened && isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [debouncedSearch, opened, dispatch]);

  const handleLoadMore = () => {
    if (!loadingUsers && hasMore) {
      dispatch(fetchUsersPaginated({ page: page + 1, search: debouncedSearch }));
    }
  };

  const handleUserToggle = (userId: string) => {
    let newSelected: string[];
    if (selectedUsers.includes(userId)) {
      newSelected = selectedUsers.filter(id => id !== userId);
    } else {
      if (selectedUsers.length >= maxSelected) {
        notifications.show({
          title: 'Limit Reached',
          message: `Maximum ${maxSelected} users allowed`,
          color: 'red',
        });
        return;
      }
      newSelected = [...selectedUsers, userId];
    }
    setSelectedUsers(newSelected);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>{label} ({selectedUsers.length}/{maxSelected} selected)</Text>
      <TextInput
        placeholder="Search users by name or email"
        leftSection={<SearchIcon width={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />
      {allSelectedUsers.length > 0 && (
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Selected Users ({allSelectedUsers.length}/{maxSelected})
          </Text>
          <Group gap="xs" wrap="wrap">
            {allSelectedUsers.map((user) => (
              <Group key={user._id} gap="xs" style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
                border: `1px solid rgba(59, 130, 246, 0.2)`
              }}>
                <Avatar
                  src={user.profileImage}
                  size="xs"
                  radius="xl"
                >
                  {getInitials(user.name)}
                </Avatar>
                <Text size="xs" fw={500} style={{ maxWidth: '120px' }} lineClamp={1}>
                  {user.name}
                </Text>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => handleUserToggle(user._id)}
                  style={{ marginLeft: 'auto' }}
                >
                  <XIcon width={12} />
                </ActionIcon>
              </Group>
            ))}
          </Group>
        </Box>
      )}
      <ScrollArea h={300} type="auto" offsetScrollbars>
        <Stack gap="xs" pr="xs">
          {users
            .filter(user => !selectedUsers.includes(user._id))
            .map((user) => (
              <Group key={user._id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Avatar
                    src={user.profileImage}
                    size="md"
                    radius="xl"
                  >
                    {getInitials(user.name)}
                  </Avatar>
                  <Stack gap={0}>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {user.name}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {user.email}
                    </Text>
                  </Stack>
                </Group>
                <Checkbox
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleUserToggle(user._id)}
                  color="blue"
                  disabled={selectedUsers.length >= maxSelected}
                />
              </Group>
            ))}
          {loadingUsers && (
            <Group justify="center" py="md">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">Loading users...</Text>
            </Group>
          )}
          {hasMore && !loadingUsers && (
            <Button
              variant="light"
              size="sm"
              onClick={handleLoadMore}
              fullWidth
            >
              Load More Users
            </Button>
          )}
          {!loadingUsers && users.filter(user => !selectedUsers.includes(user._id)).length === 0 && (
            <Text c="dimmed" ta="center" py="md">
              {selectedUsers.length > 0 ? 'All users are selected' : 'No users found'}
            </Text>
          )}
          {selectedUsers.length >= maxSelected && (
            <Text c="blue" size="sm" ta="center" py="xs">
              Maximum users reached ({maxSelected}/{maxSelected})
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
} 