import { Paper, Group, Title, Stack, Text, Button } from '@mantine/core';
import { ReactNode } from 'react';

interface RecentItemsSectionProps {
  title: string;
  items: ReactNode[];
  emptyMessage: string;
  viewMorePath: string;
  onViewMore: () => void;
}

export default function RecentItemsSection({ 
  title, 
  items, 
  emptyMessage, 
  viewMorePath, 
  onViewMore 
}: RecentItemsSectionProps) {
  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      <Group justify="space-between" align="center">
        <Title order={2}>{title}</Title>
      </Group>
      <Stack mt="md" gap="md">
        {items.length === 0 ? (
          <Text c="dimmed">{emptyMessage}</Text>
        ) : (
          items
        )}
      </Stack>
      {items.length > 0 && (
        <Group justify="center" mt="md">
          <Button variant="subtle" onClick={onViewMore}>View More</Button>
        </Group>
      )}
    </Paper>
  );
} 