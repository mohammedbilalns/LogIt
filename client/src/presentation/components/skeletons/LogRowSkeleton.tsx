import { Paper, Skeleton, Group, Stack, useMantineColorScheme } from '@mantine/core';

export default function LogRowSkeleton() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder={false}
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
        boxShadow: isDark
          ? '0 2px 12px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Skeleton height={18} width="60%" radius="sm" />
          <Skeleton height={12} width="25%" radius="sm" />
        </Group>
        <Skeleton height={28} width="90%" radius="sm" />
        <Group gap="xs">
          <Skeleton height={20} width={40} radius="xl" />
          <Skeleton height={20} width={50} radius="xl" />
          <Skeleton height={20} width={35} radius="xl" />
        </Group>
        <Group gap="xs">
          <Skeleton height={80} width="33%" radius="sm" />
          <Skeleton height={80} width="33%" radius="sm" />
          <Skeleton height={80} width="33%" radius="sm" />
        </Group>
      </Stack>
    </Paper>
  );
}
