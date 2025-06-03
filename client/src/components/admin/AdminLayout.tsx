import { Box } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@components/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <Box>
      <AdminSidebar />
      <Box style={{ marginLeft: '0rem' }}>
        <Outlet />
      </Box>
    </Box>
  );
} 