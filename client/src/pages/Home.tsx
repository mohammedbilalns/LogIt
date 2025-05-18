import { Container, Title, Text, Button, Group } from '@mantine/core';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function Home() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Container size="lg" py="xl">
      <Title order={1} ta="center" mt="md">
        Welcome to LogIt
      </Title>

      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
        Hello, {user?.name}! This is your protected home page. You can only see this page when you're
        logged in.
      </Text>

      <Group justify="center" mt="xl">
        <Button size="md" radius="xl">
          Get Started
        </Button>
      </Group>
    </Container>
  );
} 