import {
  ActionIcon,
  Paper,
  Stack,
  useMantineColorScheme,
  Group,
  Text,
  UnstyledButton,
  Box,
  Portal,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { DashboardIcon } from '../icons/DashboardIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { ReportAnalyticsIcon } from '../icons/ReportAnalyticsIcon';
import { TagsIcon } from '../icons/TagsIcon';
import { SubscriptionIcon } from '../icons/SubscriptionIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { ShieldIcon } from '../icons/ShieldIcon';
import { Menu2Icon } from '../icons/Menu2Icon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar } from '@/store/slices/uiSlice';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useSelector((state: RootState) => state.auth);
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const sidebarItems = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/admin' },
    { icon: UsersIcon, label: 'User Management', path: '/admin/users' },
    { icon: ReportAnalyticsIcon, label: 'Reports Management', path: '/admin/reports' },
    { icon: TagsIcon, label: 'Tag Management', path: '/admin/tags' },
    { icon: SubscriptionIcon, label: 'Subscription Settings', path: '/admin/subscriptions' },
    { icon: ChartBarIcon, label: 'Analytics', path: '/admin/analytics' },
  ];

  if (user?.role === 'superadmin') {
    sidebarItems.push({
      icon: ShieldIcon,
      label: 'Admin Management',
      path: '/admin/manage-admins',
    });
  }

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  };

  return (
    <>
      {!isOpen && (
        <Portal>
          <ActionIcon
            variant="filled"
            size="lg"
            color="blue"
            radius="xl"
            onClick={handleToggleSidebar}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '2rem',
              zIndex: 1000,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            }}
          >
            <Menu2Icon width={20} height={20} />
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
          p="md"
          style={{
            position: 'fixed',
            left: isMobile ? (isOpen ? '1rem' : '-300px') : (isOpen ? '1rem' : '-300px'),
            top: '5rem',
            width: '250px',
            height: 'calc(100vh - 6rem)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            borderRadius: 'var(--mantine-radius-lg)',
            transition: 'left 0.3s ease',
            background: isDark
              ? 'rgba(30, 30, 30, 0.6)'
              : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(12px)',
            boxShadow: isDark
              ? '0 4px 30px rgba(0,0,0,0.4)'
              : '0 4px 20px rgba(0,0,0,0.15)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <Stack gap="xs" style={{ overflowY: 'auto' }}>
            {sidebarItems.map((item, index) => {
              const isActive = location.pathname === item.path;

              return (
                <Group key={item.label} justify="space-between" align="center" wrap="nowrap">
                  <UnstyledButton
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      borderRadius: 'var(--mantine-radius-md)',
                      backgroundColor: isActive
                        ? (isDark ? 'rgba(51, 110, 255, 0.4)' : 'rgba(51, 110, 255, 0.1)')
                        : 'transparent',
                      padding: '0.5rem',
                      transition: 'background-color 150ms ease',
                      flex: 1,
                      '&:hover': {
                        backgroundColor: isDark
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.03)',
                      },
                    }}
                  >
                    <Group gap="md">
                      <ActionIcon
                        variant={isActive ? 'filled' : 'light'}
                        size="lg"
                        color="blue"
                        radius="md"
                      >
                        <item.icon width={20} height={20} />
                      </ActionIcon>
                      <Text
                        size="sm"
                        fw={isActive ? 600 : 400}
                        c={
                          isActive
                            ? isDark
                              ? 'white'
                              : 'var(--mantine-color-blue-9)'
                            : undefined
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
                      size="sm"
                      style={{
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                        transition: 'transform 0.3s ease',
                        marginLeft: '0.5rem',
                      }}
                    >
                      <ChevronLeftIcon width={16} height={16} />
                    </ActionIcon>
                  )}
                </Group>
              );
            })}
          </Stack>
        </Paper>
      </Portal>
    </>
  );
}
