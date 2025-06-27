import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  Avatar,
  Checkbox,
  ScrollArea,
  Loader,
  useMantineColorScheme,
  useMantineTheme,
  rem,
  Box,
  ActionIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createGroupChat, fetchUserChats } from '@/store/slices/chatSlice';
import { notifications } from '@mantine/notifications';
import axios from '@/api/axios';
import { SearchIcon } from '../icons/SearchIcon';
import { useDebouncedValue } from '@mantine/hooks';
import { XIcon } from '../icons/XIcon';
import UserSearchList from './UserSearchList';

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface CreateGroupForm {
  name: string;
  participants: string[];
}

interface CreateGroupModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({
  opened,
  onClose,
}: CreateGroupModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === 'dark';
  const { loading } = useSelector((state: RootState) => state.chat);

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);
  const isInitialLoad = useRef(true);
  const [allSelectedUsers, setAllSelectedUsers] = useState<User[]>([]);

  const form = useForm<CreateGroupForm>({
    initialValues: {
      name: '',
      participants: [],
    },
    validate: {
      name: (value) => {
        if (!value.trim()) return 'Group name is required';
        if (value.trim().length < 2) return 'Group name must be at least 2 characters';
        if (value.trim().length > 50) return 'Group name must not exceed 50 characters';
        return null;
      },
      participants: (value) => {
        if (value.length === 0) return 'Please select at least one participant';
        if (value.length > 9) return 'Maximum 9 participants allowed';
        return null;
      },
    },
  });

  // Sync selectedUsers to form participants field for Mantine form validation
  useEffect(() => {
    form.setFieldValue('participants', selectedUsers);
  }, [selectedUsers]);

  const fetchUsers = async (pageNum: number = 1, search: string = '') => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(`/user/users?page=${pageNum}&limit=10&search=${encodeURIComponent(search)}`);
      const newUsers = response.data.users;
      if (pageNum === 1) {
        setUsers(newUsers);
      } else {
        setUsers(prev => [...prev, ...newUsers]);
      }
      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch users',
        color: 'red',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const selectedUserObjects = users.filter(user => selectedUsers.includes(user._id));
    setAllSelectedUsers(prev => {
      const existingSelected = prev.filter(user => !users.some(u => u._id === user._id));
      return [...existingSelected, ...selectedUserObjects];
    });
  }, [selectedUsers, users]);

  useEffect(() => {
    if (opened) {
      fetchUsers(1, '');
      setSelectedUsers([]);
      setAllSelectedUsers([]);
      form.reset();
      setSearchQuery('');
      isInitialLoad.current = true;
    }
  }, [opened]);

  useEffect(() => {
    if (opened && !isInitialLoad.current) {
      fetchUsers(1, debouncedSearch);
    }
    if (opened && isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [debouncedSearch, opened]);

  const handleLoadMore = () => {
    if (!loadingUsers && hasMore) {
      fetchUsers(page + 1, debouncedSearch);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        if (prev.length >= 9) {
          notifications.show({
            title: 'Limit Reached',
            message: 'Maximum 9 participants allowed for group chats',
            color: 'red',
          });
          return prev;
        }
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (values: CreateGroupForm) => {
    if (selectedUsers.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Please select at least one participant',
        color: 'red',
      });
      return;
    }
    if (selectedUsers.length > 9) {
      notifications.show({
        title: 'Error',
        message: 'Maximum 9 participants allowed for group chats',
        color: 'red',
      });
      return;
    }
    try {
      await dispatch(createGroupChat({
        name: values.name,
        participants: selectedUsers,
      })).unwrap();
      notifications.show({
        title: 'Success',
        message: 'Group chat created successfully',
        color: 'green',
      });
      dispatch(fetchUserChats());
      onClose();
      setSelectedUsers([]);
      setAllSelectedUsers([]);
      form.reset();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error || 'Failed to create group chat',
        color: 'red',
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Group Chat"
      centered
      size="md"
      overlayProps={{
        blur: 6,
        backgroundOpacity: 0.35,
        color: '#000',
        zIndex: 3000,
      }}
      zIndex={3100}
      styles={{
        content: {
          borderRadius: rem(16),
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)',
          backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        },
        header: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Group Name"
            placeholder="Enter group name"
            required
            {...form.getInputProps('name')}
          />

          <UserSearchList
            opened={opened}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            maxSelected={9}
            label="Select Participants"
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || selectedUsers.length === 0 || !!form.errors.name || selectedUsers.length > 9}
            >
              Create Group
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
} 