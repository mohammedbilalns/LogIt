import { Container, Paper } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ReactNode } from 'react';

interface AuthContainerProps {
  children: ReactNode;
  size?: number;
  my?: number;
  mt?: number;
  withBorder?: boolean;
}

export default function AuthContainer({ 
  children, 
  size = 580, 
  my = 40, 
  mt = 140, 
  withBorder = false 
}: AuthContainerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Container size={size} my={my} mt={mt} px={isMobile ? 'xs' : 'md'}>
      <Paper
        radius="lg"
        p={isMobile ? 'md' : 'xl'}
        withBorder={withBorder}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {children}
      </Paper>
    </Container>
  );
} 