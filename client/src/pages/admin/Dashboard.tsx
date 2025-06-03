import { Container, Grid, Paper, Text, Title, Group, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { IconUsers, IconNotes, IconSettings } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMediaQuery } from '@mantine/hooks';

export default function AdminDashboard() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) => (
    <Paper 
      shadow="sm" 
      p="md" 
      radius="md"
      style={{
        backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows.md,
        },
      }}
    >
      <Group>
        <Icon size={24} color={theme.colors.blue[6]} />
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
    <Container 
      size="lg" 
      py="xl"
      style={{
        marginLeft: isOpen ? '280px' : '0',
        transition: 'margin-left 0.3s ease',
        width: isOpen ? 'calc(100% - 280px)' : '100%',
        ...(isMobile && {
          marginLeft: '0',
          width: '100%',
          padding: '1rem',
        })
      }}
    >
      <Title order={2} mb="xl">Admin Dashboard</Title>

      {/* Statistics */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StatCard title="Total Users" value={10} icon={IconUsers} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StatCard title="Total Posts" value="156" icon={IconNotes} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StatCard title="System Status" value="Healthy" icon={IconSettings} />
        </Grid.Col>
      </Grid>
    </Container>
  );
} 