import { ActionIcon, Paper, Stack, useMantineColorScheme, Group, Text, UnstyledButton } from '@mantine/core';
import { IconDashboard, IconUsers, IconReportAnalytics, IconTags, IconSubscript, IconChartBar, IconShield } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useSelector((state: RootState) => state.auth);

  const sidebarItems = [
    {
      icon: IconDashboard,
      label: 'Dashboard',
      path: '/admin',
    },
    {
      icon: IconUsers,
      label: 'User Management',
      path: '/admin/users',
    },
    {
      icon: IconReportAnalytics,
      label: 'Reports Management',
      path: '/admin/reports',
    },
    {
      icon: IconTags,
      label: 'Tag Management',
      path: '/admin/tags',
    },
    {
      icon: IconSubscript,
      label: 'Subscription Settings',
      path: '/admin/subscriptions',
    },
    {
      icon: IconChartBar,
      label: 'Analytics',
      path: '/admin/analytics',
    },
  ];

  // Add Admin Management button for superadmin
  if (user?.role === 'superadmin') {
    sidebarItems.push({
      icon: IconShield,
      label: 'Admin Management',
      path: '/admin/manage-admins',
    });
  }

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
      }}
    >
      <Stack gap="xs">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
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
    </Paper>
  );
} 