import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Title,
  TextInput,
  Table,
  Button,
  Group,
  Text,
  Badge,
  Paper,
  Loader,
  Avatar,
  Stack,
  Box,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { AppDispatch, RootState } from '../../store';
import { fetchUsers, setSearchQuery } from '../../store/slices/userManagementSlice';
import { useDebouncedValue } from '@mantine/hooks';

export default function UserManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 500);
  const [localPage, setLocalPage] = useState(1);

  const { users, loading, error, hasMore } = useSelector(
    (state: RootState) => state.userManagement
  );

  const loadUsers = useCallback(
    (page: number, search: string) => {
      dispatch(fetchUsers({ page, limit: 12, search }));
    },
    [dispatch]
  );

  useEffect(() => {
    setLocalPage(1);
    dispatch(setSearchQuery(debouncedSearch));
    loadUsers(1, debouncedSearch);
  }, [debouncedSearch, dispatch, loadUsers]);

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (documentHeight - scrollPosition <= window.innerHeight * 1.5 && !loading && hasMore) {
      const nextPage = localPage + 1;
      setLocalPage(nextPage);
      loadUsers(nextPage, debouncedSearch);
    }
  }, [loading, hasMore, localPage, loadUsers, debouncedSearch]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container size="xl" py="xl" px="xl" style={{ marginLeft: '280px' }}>
      <Stack gap="lg">
        <Paper 
          shadow="xs" 
          p="md" 
          withBorder 
          style={{ 
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'var(--mantine-color-body)'
          }}
        >
          <Group justify="space-between">
            <Title order={2} fw={600}>User Management</Title>
            <TextInput
              placeholder="Search users by name or email"
              leftSection={<IconSearch size={16} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
              style={{ width: '300px' }}
              size="md"
            />
          </Group>
        </Paper>

        <Paper shadow="xs" p="md" withBorder>
          <Stack gap="md">
            <Table striped highlightOnHover withTableBorder withColumnBorders>
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
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Avatar
                        src={user.profileImage}
                        alt={user.name}
                        size="lg"
                        radius="xl"
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="md" fw={500}>
                        {user.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="md" c="dimmed">
                        {user.email}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="md">
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
                        color={user.isVerified ? 'green' : 'red'}
                        variant="light"
                        size="lg"
                      >
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="md" c="dimmed">
                        {formatDate(user.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="subtle"
                        color={user.isVerified ? 'red' : 'green'}
                        size="sm"
                        radius="xl"
                      >
                        {user.isVerified ? 'Block' : 'Unblock'}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

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
                  <Text size="sm" c="dimmed">Loading more users...</Text>
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
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
} 