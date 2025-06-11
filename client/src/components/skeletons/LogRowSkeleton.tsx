import { Paper, Skeleton, Group, Stack } from '@mantine/core';

export default function LogRowSkeleton() {
  return (
    <Paper p="md" shadow="sm" radius="md" withBorder>
      <Stack gap="sm">
        <Skeleton height={12} width="30%" />
        <Skeleton height={16} width="80%" />
        <Group gap="xs">
          <Skeleton height={10} width={40} radius="xl" />
          <Skeleton height={10} width={50} radius="xl" />
          <Skeleton height={10} width={30} radius="xl" />
        </Group>
      </Stack>
    </Paper>
  );
} 