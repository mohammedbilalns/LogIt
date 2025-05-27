import { ActionIcon, Paper, Stack, useMantineColorScheme, Group, Text, UnstyledButton, Box, Divider, Avatar, Portal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconHome, IconArticle, IconNotes, IconMessage, IconNetwork, IconMenu2 } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useState } from 'react';

export default function UserSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isMobile && !isOpen && (
        <Portal>
          <ActionIcon
            variant="filled"
            size="lg"
            color="blue"
            radius="xl"
            onClick={toggleSidebar}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '2rem',
              zIndex: 1000,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            }}
          >
            <IconMenu2 size={20} />
          </ActionIcon>
        </Portal>
      )}

      {isMobile && isOpen && (
        <Portal>
          <Box
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
            onClick={toggleSidebar}
          />
        </Portal>
      )}

      <Portal>
        <Paper
          shadow="md"
          p="md"
          style={{
            position: 'fixed',
            left: isMobile ? (isOpen ? '1rem' : '-300px') : '1rem',
            top: '5rem',
            backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
            borderRadius: 'var(--mantine-radius-lg)',
            width: '250px',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 6rem)',
            justifyContent: 'space-between',
            transition: 'left 0.3s ease',
            zIndex: 1001,
            overflow: 'hidden',
          }}
        >
          <Stack gap="xs" style={{ overflowY: 'auto' }}>
            {sidebarItems.map((item) => {
              const isActive = item.path === '/articles' 
                ? location.pathname.startsWith('/articles')
                : location.pathname === item.path;
              return (
                <UnstyledButton
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
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
            <UnstyledButton
              onClick={() => handleNavigation('/profile')}
              style={{
                borderRadius: 'var(--mantine-radius-md)',
                backgroundColor: location.pathname === '/profile'
                  ? (isDark ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-blue-0)')
                  : 'transparent',
                padding: '0.5rem',
                transition: 'background-color 150ms ease',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Group gap="sm" align="center" style={{ flexWrap: 'nowrap', width: '100%' }}>
                <Avatar 
                  color="blue" 
                  radius="xl"
                  src={user?.profileImage}
                >
                  {getInitials(user?.name)}
                </Avatar>
                <Box style={{ overflow: 'hidden' }}>
                  <Text
                    size="sm"
                    fw={600}
                    truncate
                    c={location.pathname === '/profile'
                      ? (isDark ? 'white' : 'var(--mantine-color-blue-9)')
                      : undefined}
                  >
                    {user?.name || 'User'}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {user?.email || ''}
                  </Text>
                </Box>
              </Group>
            </UnstyledButton>
          </Box>
        </Paper>
      </Portal>
    </>
  );
} 