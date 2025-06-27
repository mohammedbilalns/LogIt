import { Paper, Group, Avatar, Stack, Text, Skeleton } from '@mantine/core';

export default function GroupChatListSkeleton() {
  return (
    <Stack gap="sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <Paper
          key={i}
          withBorder
          radius="md"
          p="md"
          style={{ opacity: 0.8 }}
        >
          <Group align="center">
            <Skeleton height={48} width={48} radius="xl" />
            <Stack gap={0} style={{ flex: 1 }}>
              <Group gap="xs" justify="space-between">
                <Skeleton height={16} width={120} radius="sm" />
                <Skeleton height={12} width={60} radius="sm" />
              </Group>
              <Skeleton height={12} width="80%" radius="sm" mt={4} />
            </Stack>
            <Skeleton height={24} width={32} radius="xl" />
          </Group>
        </Paper>
      ))}
    </Stack>
  );
} 