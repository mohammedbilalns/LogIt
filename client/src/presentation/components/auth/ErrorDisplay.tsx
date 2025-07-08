import { Text } from '@mantine/core';

interface ErrorDisplayProps {
  error?: string | null;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <Text c="red" size="sm" ta="center">
      {error}
    </Text>
  );
} 