import { Container, Grid, Paper, Text, Title, Group  } from '@mantine/core';
import { IconUsers, IconNotes, IconSettings } from '@tabler/icons-react';


export default function AdminDashboard() {

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
          <StatCard title="Total Users" value={10} icon={IconUsers} />
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