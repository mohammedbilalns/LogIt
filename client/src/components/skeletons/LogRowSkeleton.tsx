import { Paper, Skeleton, Group, Stack, useMantineColorScheme } from '@mantine/core';

export default function LogRowSkeleton() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Paper
      p="md"
      radius="lg"
      withBorder={false}
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
        boxShadow: isDark
          ? '0 4px 24px rgba(0,0,0,0.5)'
          : '0 4px 16px rgba(0,0,0,0.1)',
      }}
    >
      <Stack gap="sm">
        <Skeleton height={14} width="30%" radius="sm" />
        <Skeleton height={18} width="80%" radius="sm" />
        <Group gap="xs">
          <Skeleton height={12} width={40} radius="xl" />
          <Skeleton height={12} width={50} radius="xl" />
          <Skeleton height={12} width={30} radius="xl" />
        </Group>
        <Skeleton height={160} radius="sm" />
      </Stack>
    </Paper>
  );
}
