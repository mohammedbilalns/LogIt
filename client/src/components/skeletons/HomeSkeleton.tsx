import { Paper, Group, Stack, Skeleton, Grid, Box } from '@mantine/core';

export function StatsSkeleton() {
  return (
    <Grid gutter="md">
      {[1, 2, 3, 4].map((index) => (
        <Grid.Col span={{ base: 6, sm: 3 }} key={index}>
          <Paper shadow="sm" radius="md" p="md" withBorder>
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Skeleton height={40} circle />
              </Group>
              <Skeleton height={28} width="60%" />
              <Skeleton height={16} width="40%" />
            </Stack>
          </Paper>
        </Grid.Col>
      ))}
    </Grid>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      <Skeleton height={32} width="40%" mb="md" />
      <Stack gap="sm">
        {[1, 2, 3].map((index) => (
          <Box key={index} py="xs">
            <Skeleton height={20} width="80%" mb={8} />
            <Skeleton height={16} width="40%" />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export function ChartSkeleton() {
  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      <Skeleton height={32} width="40%" mb="md" />
      <Box
        style={{
          height: 200,
          width: '100%',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        <Skeleton height="100%" />
      </Box>
      <Group mt="md" justify="space-between">
        <Skeleton height={36} width={120} />
        <Skeleton height={36} width={120} />
      </Group>
    </Paper>
  );
}

export function ContentListSkeleton() {
  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      <Group justify="space-between" align="center">
        <Skeleton height={32} width="30%" />
      </Group>
      <Stack mt="md" gap="md">
        {[1, 2, 3].map((index) => (
          <Box key={index}>
            <Skeleton height={24} width="90%" mb={8} />
            <Skeleton height={16} width="60%" mb={8} />
            <Skeleton height={16} width="40%" />
          </Box>
        ))}
      </Stack>
      <Group justify="center" mt="md">
        <Skeleton height={36} width={100} />
      </Group>
    </Paper>
  );
}

export function HomeSkeleton() {
  return (
    <Stack gap="xl">
      {/* Welcome Section Skeleton */}
      <Skeleton height={40} width="60%" />

      {/* Stats Section Skeleton */}
      <StatsSkeleton />

      {/* Recent Activity & Chart Section Skeleton */}
      <Grid gutter="md">
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