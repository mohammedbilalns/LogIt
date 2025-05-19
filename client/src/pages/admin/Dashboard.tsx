import { Container, Grid, Paper, Text, Title, Group  } from '@mantine/core';
import { IconUsers, IconNotes, IconSettings } from '@tabler/icons-react';
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

     
    </Container>
  );
} 