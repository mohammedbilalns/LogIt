import { Container, Grid, Paper, Text, Title, Group, Button, ActionIcon } from '@mantine/core';
import { IconUsers, IconNotes, IconSettings, IconTrash, IconEdit } from '@tabler/icons-react';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
}

// Mock data - replace with actual API calls
const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', lastActive: '2024-03-10' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin', lastActive: '2024-03-11' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'user', lastActive: '2024-03-09' },
];

export default function AdminDashboard() {
  const [users] = useState<User[]>(mockUsers);

  const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) => (
    <Paper shadow="sm" p="md" radius="md">
      <Group>
        <Icon size={24} />
        <div>
          <Text size="xs" c="dimmed">
            {title}
          </Text>
          <Text size="lg" fw={500}>
            {value}
          </Text>
        </div>
      </Group>
    </Paper>
  );

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">Admin Dashboard</Title>

      {/* Statistics */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <StatCard title="Total Users" value={users.length} icon={IconUsers} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <StatCard title="Total Posts" value="156" icon={IconNotes} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <StatCard title="System Status" value="Healthy" icon={IconSettings} />
        </Grid.Col>
      </Grid>

      {/* User Management */}
      <Paper shadow="sm" p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={3}>User Management</Title>
          <Button>Add User</Button>
        </Group>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Last Active</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                  <td style={{ padding: '12px' }}>{user.name}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>{user.role}</td>
                  <td style={{ padding: '12px' }}>{user.lastActive}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon variant="subtle" color="blue">
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red">
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Paper>
    </Container>
  );
} 