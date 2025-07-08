import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { HomeIcon } from '../icons/HomeIcon';
import { Menu2Icon } from '../icons/Menu2Icon';
import { MessageIcon } from '../icons/MessageIcon';
import { NetworkIcon } from '../icons/NetworkIcon';
import { NotesIcon } from '../icons/NotesIcon';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Avatar,
  Box,
  Divider,
  Group,
  Paper,
  Portal,
  Stack,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { RootState } from '@/infrastructure/store';
import { toggleSidebar } from '@/infrastructure/store/slices/uiSlice';
import { ArticleIcon } from '../icons/ArticleIcon';

interface UserSidebarProps {
  isModalOpen?: boolean;
}

export default function UserSidebar({ isModalOpen = false }: UserSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useSelector((state: RootState) => state.auth);
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const shouldRenderSidebar = !isModalOpen;

  if (!shouldRenderSidebar) return null;

  const sidebarItems = [
    { icon: HomeIcon, label: 'Home', path: '/home' },
    { icon: ArticleIcon, label: 'Articles', path: '/articles' },
    { icon: NotesIcon, label: 'Logs', path: '/logs' },
    { icon: MessageIcon, label: 'Chats', path: '/chats' },
    { icon: NetworkIcon, label: 'Network', path: '/network' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0];
  };

  const handleToggleSidebar = () => dispatch(toggleSidebar());

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) dispatch(toggleSidebar());
  };

  return (
    <>
      {!isOpen && (
        <Portal>
          <ActionIcon
            variant="filled"
            size="md"
            color="blue"
            radius="xl"
            onClick={handleToggleSidebar}
            style={{
              position: 'fixed',
              bottom: isMobile ? '3.5rem' : '1.5rem',
              left: '1.5rem',
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <Menu2Icon width={16} />
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
            onClick={handleToggleSidebar}
          />
        </Portal>
      )}

      <Portal>
        <Paper
          p="sm"
          style={{
            position: 'fixed',
            left: isMobile ? (isOpen ? '0.75rem' : '-280px') : isOpen ? '0.75rem' : '-280px',
            top: '4rem',
            width: '220px',
            height: 'calc(100vh - 5rem)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 1001,
            transition: 'left 0.3s ease',
            overflow: 'hidden',
            borderRadius: '0.75rem',
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
          }}
        >
          <Stack gap="xs" style={{ overflowY: 'auto' }}>
            {sidebarItems.map((item, index) => {
              const isActive =
                item.path === '/articles'
                  ? location.pathname.startsWith('/articles')
                  : item.path === '/logs'
                    ? location.pathname.startsWith('/logs')
                    : location.pathname === item.path;

              return (
                <Group key={item.label} justify="space-between" align="center" wrap="nowrap">
                  <UnstyledButton
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      borderRadius: '0.5rem',
                      backgroundColor: isActive
                        ? isDark
                          ? 'rgba(0, 123, 255, 0.25)'
                          : 'rgba(0, 123, 255, 0.1)'
                        : 'transparent',
                      padding: '0.375rem',
                      flex: 1,
                      transition: 'background-color 150ms ease',
                    }}
                  >
                    <Group gap="sm">
                      <Box
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '0.375rem',
                          backgroundColor: isActive
                            ? 'var(--mantine-color-blue-6)'
                            : isDark
                              ? 'rgba(0, 123, 255, 0.1)'
                              : 'rgba(0, 123, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isActive ? 'white' : 'var(--mantine-color-blue-6)',
                        }}
                      >
                        <item.icon width={16} />
                      </Box>
                      <Text
                        size="sm"
                        fw={isActive ? 600 : 400}
                        c={
                          isActive ? (isDark ? 'white' : 'var(--mantine-color-blue-9)') : undefined
                        }
                      >
                        {item.label}
                      </Text>
                    </Group>
                  </UnstyledButton>
                  {index === 0 && (
                    <ActionIcon
                      variant="light"
                      color="blue"
                      radius="xl"
                      onClick={handleToggleSidebar}
                      size="xs"
                      style={{
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                        transition: 'transform 0.3s ease',
                        marginLeft: '0.25rem',
                      }}
                    >
                      <ChevronLeftIcon width={12} />
                    </ActionIcon>
                  )}
                </Group>
              );
            })}
          </Stack>

          <Box>
            <Divider my="xs" />
            <UnstyledButton
              onClick={() => handleNavigation('/profile')}
              style={{
                borderRadius: '0.5rem',
                backgroundColor:
                  location.pathname === '/profile'
                    ? isDark
                      ? 'rgba(0, 123, 255, 0.25)'
                      : 'rgba(0, 123, 255, 0.1)'
                    : 'transparent',
                padding: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Group gap="sm" align="center" style={{ flexWrap: 'nowrap', width: '100%' }}>
                <Avatar color="blue" radius="md" size="sm" src={user?.profileImage}>
                  {getInitials(user?.name)}
                </Avatar>
                <Box style={{ overflow: 'hidden' }}>
                  <Text
                    size="sm"
                    fw={600}
                    truncate
                    c={
                      location.pathname === '/profile'
                        ? isDark
                          ? 'white'
                          : 'var(--mantine-color-blue-9)'
                        : undefined
                    }
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
