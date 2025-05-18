import { Container, Title, Text, Button, Group, Image } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container size="md" py={40}>
      <div style={{ textAlign: 'center' }}>
        <Image
          src="/404.svg"
          alt="404 illustration"
          w={300}
          h={300}
          fit="contain"
          mx="auto"
          mb={32}
          fallbackSrc="https://placehold.co/300x300?text=404"
        />
        
        <Title order={1} size="2.5rem" mb="xs">
          Page Not Found
        </Title>
        
        <Text c="dimmed" size="lg" maw={580} mx="auto" mb={32}>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Text>

        <Group justify="center">
          <Button
            size="md"
            radius="xl"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Group>
      </div>
    </Container>
  );
} 