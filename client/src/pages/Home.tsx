import { Container, Title, Text, Button, Group } from '@mantine/core';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import CreateButton from '@components/CreateButton';
import { useMediaQuery } from '@mantine/hooks';

export default function Home() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Container 
      size="lg" 
      py="xl"
      style={{
        marginLeft: isMobile ? '16px' : (isSidebarOpen ? '290px' : '16px'),
        marginRight: isMobile ? '16px' : '30px',
        paddingLeft: isMobile ? '0' : '16px',
        transition: 'margin-left 0.3s ease',
      }}
    >
      <Title order={1} ta="center" mt="md">
        Welcome to LogIt
      </Title>

      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
        Hello, {user?.name}! 
      </Text>

      <Group justify="center" mt="xl">
        <Button size="md" radius="xl">
          Get Started
        </Button>
      </Group>

      <CreateButton position="right" />
    </Container>
  );
} 