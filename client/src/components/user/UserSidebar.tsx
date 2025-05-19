import { ActionIcon, Paper, Stack, useMantineColorScheme, Group, Text, UnstyledButton, Box, Divider, Avatar } from '@mantine/core';
import { IconHome, IconArticle, IconNotes, IconMessage, IconNetwork } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function UserSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useSelector((state: RootState) => state.auth);

  const sidebarItems = [
    {
      icon: IconHome,
      label: 'Home',
      path: '/',
    },
    {
      icon: IconArticle,
      label: 'Articles',
      path: '/articles',
    },
    {
      icon: IconNotes,
      label: 'Logs',
      path: '/logs',
    },
    {
      icon: IconMessage,
      label: 'Chats',
      path: '/chats',
    },
    {
      icon: IconNetwork,
      label: 'Network',
      path: '/network',
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) {
      return '?';
    }
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0][0];
    }
    return parts[0][0] + parts[parts.length - 1][0];
  };

  return (
    <Paper
      shadow="md"
      p="md"
      style={{
        position: 'fixed',
        left: '1rem',
        top: '5rem',
        backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
        borderRadius: 'var(--mantine-radius-lg)',
        zIndex: 100,
        width: '250px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 6rem)',
        justifyContent: 'space-between',
      }}
    >
      <Stack gap="xs">
        {sidebarItems.map((item) => {
          const isActive = item.path === '/articles' 
            ? location.pathname.startsWith('/articles')
            : location.pathname === item.path;
          return (
            <UnstyledButton
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                borderRadius: 'var(--mantine-radius-md)',
                backgroundColor: isActive 
                  ? (isDark ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-blue-0)')
                  : 'transparent',
                padding: '0.5rem',
                transition: 'background-color 150ms ease',
                '&:hover': {
                  backgroundColor: isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-0)',
                },
              }}
            >
              <Group gap="md">
                <ActionIcon
                  variant={isActive ? "filled" : "light"}
                  size="lg"
                  color="blue"
                  radius="md"
                >
                  <item.icon size={20} />
                </ActionIcon>
                <Text 
                  size="sm" 
                  fw={isActive ? 600 : 400}
                  c={isActive ? (isDark ? 'white' : 'var(--mantine-color-blue-9)') : undefined}
                >
                  {item.label}
                </Text>
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>
      <Box>
        <Divider my="sm" />
        <Group gap="sm" align="center">
          <Avatar color="blue" radius="xl">
            {getInitials(user?.name)}
          </Avatar>
          <Box>
            <Text size="sm" fw={600}>{user?.name || 'User'}</Text>
            <Text size="xs" c="dimmed">{user?.email || ''}</Text>
          </Box>
        </Group>
      </Box>
    </Paper>
  );
} 