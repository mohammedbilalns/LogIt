import { Box, Group, Paper, Skeleton, useMantineColorScheme } from '@mantine/core';

export default function ArticleRowSkeleton() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Paper
      radius="md"
      p="sm"
      withBorder={false}
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
        boxShadow: isDark
          ? '0 2px 12px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Group align="flex-start" wrap="nowrap" gap="sm">
        <Skeleton height={80} width={80} radius="sm" />
        <Box style={{ flex: 1 }}>
          <Skeleton height={20} width="70%" mb={4} />
          <Group gap="xs" mb={4}>
            <Skeleton height={12} width="25%" />
            <Skeleton height={12} width="20%" />
          </Group>
          <Skeleton height={32} width="100%" mb={4} />
          <Group gap="xs" mb={4}>
            <Skeleton height={20} width={50} radius="xl" />
            <Skeleton height={20} width={60} radius="xl" />
            <Skeleton height={20} width={40} radius="xl" />
          </Group>
        </Box>
      </Group>
    </Paper>
  );
}
