import { Center, Title, Text } from '@mantine/core';
import { ReactNode } from 'react';

interface AuthHeaderProps {
  icon: ReactNode;
  title: string;
  description: string | ReactNode;
}

export default function AuthHeader({ icon, title, description }: AuthHeaderProps) {
  return (
    <>
      <Center mb="lg">
        {icon}
      </Center>

      <Title order={2} ta="center" mb="xs" fw={700}>
        {title}
      </Title>

      <Text c="dimmed" size="sm" ta="center" mb="lg">
        {description}
      </Text>
    </>
  );
} 