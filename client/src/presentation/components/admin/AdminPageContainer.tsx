import { Box, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/infrastructure/store';
import { ReactNode, useMemo } from 'react';

interface AdminPageContainerProps {
  children: ReactNode;
}

export default function AdminPageContainer({ children }: AdminPageContainerProps) {
  const theme = useMantineTheme();
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const containerStyle = useMemo(() => ({
    marginLeft: isOpen && !isMobile ? '266px' : '0px', // 250px sidebar + 1rem (16px) left position
    transition: 'margin-left 0.3s ease',
    width: isOpen && !isMobile ? 'calc(100% - 266px)' : '100%',
    maxWidth: '100%',
  }), [isOpen, isMobile]);

  return (
    <Box style={containerStyle}>
      {children}
    </Box>
  );
} 