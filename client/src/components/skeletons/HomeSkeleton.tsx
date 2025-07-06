import { Paper, Group, Stack, Skeleton, Grid, Box } from '@mantine/core';

export function StatsSkeleton() {
  return (
    <Grid gutter="sm">
      {[1, 2, 3, 4].map((index) => (
        <Grid.Col span={{ base: 6, sm: 3 }} key={index}>
          <Paper shadow="xs" radius="md" p="sm" withBorder={false}>
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Skeleton height={32} circle />
                <Skeleton height={16} width={40} />
              </Group>
              <Skeleton height={24} width="70%" />
              <Skeleton height={14} width="50%" />
            </Stack>
          </Paper>
        </Grid.Col>
      ))}
    </Grid>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Paper shadow="xs" radius="md" p="sm" withBorder={false}>
      <Skeleton height={28} width="35%" mb="sm" />
      <Stack gap="xs">
        {[1, 2, 3].map((index) => (
          <Box key={index} py="xs">
            <Skeleton height={18} width="85%" mb={6} />
            <Skeleton height={14} width="45%" />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export function ChartSkeleton() {
  return (
    <Paper shadow="xs" radius="md" p="sm" withBorder={false}>
      <Skeleton height={28} width="35%" mb="sm" />
      <Box
        style={{
          height: 180,
          width: '100%',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        <Skeleton height="100%" />
      </Box>
      <Group mt="sm" justify="space-between">
        <Skeleton height={32} width={100} />
        <Skeleton height={32} width={100} />
      </Group>
    </Paper>
  );
}

export function ContentListSkeleton() {
  return (
    <Paper shadow="xs" radius="md" p="sm" withBorder={false}>
      <Group justify="space-between" align="center">
        <Skeleton height={28} width="25%" />
        <Skeleton height={32} width={80} />
      </Group>
      <Stack mt="sm" gap="sm">
        {[1, 2, 3].map((index) => (
          <Box key={index} py="xs">
            <Group gap="sm" align="flex-start">
              <Skeleton height={48} width={48} radius="md" />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Skeleton height={20} width="90%" mb={6} />
                <Skeleton height={16} width="65%" mb={6} />
                <Group gap="xs">
                  <Skeleton height={20} width={60} radius="xl" />
                  <Skeleton height={20} width={80} radius="xl" />
                </Group>
              </Box>
            </Group>
          </Box>
        ))}
      </Stack>
      <Group justify="center" mt="sm">
        <Skeleton height={32} width={80} />
      </Group>
    </Paper>
  );
}

export function HomeSkeleton() {
  return (
    <Stack gap="lg">
      {/* Welcome Section Skeleton */}
      <Skeleton height={36} width="55%" />

      {/* Stats Section Skeleton */}
      <StatsSkeleton />

      {/* Recent Activity & Chart Section Skeleton */}
      <Grid gutter="sm">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <RecentActivitySkeleton />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ChartSkeleton />
        </Grid.Col>
      </Grid>

      {/* Recent Logs Skeleton */}
      <ContentListSkeleton />

      {/* Recent Articles Skeleton */}
      <ContentListSkeleton />
    </Stack>
  );
} 