import { Box, useMantineTheme } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/presentation/components/admin/AdminSidebar';
import { useSelector } from 'react-redux';
import { RootState } from '@/infrastructure/store';
import { useMediaQuery } from '@mantine/hooks';

export default function AdminLayout() {
  const theme = useMantineTheme();
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Box
      style={{
        display: 'flex',
        marginLeft: isOpen && !isMobile ? '20px' : '0',
        transition: 'margin-left 0.3s ease',
      }}
    >
      <AdminSidebar />
      <Box style={{ flexGrow: 1, padding: isMobile ? '1rem' : '1.5rem' }}>
        <Outlet />
      </Box>
    </Box>
  );
} 