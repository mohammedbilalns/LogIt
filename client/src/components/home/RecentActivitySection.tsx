import { Paper, Title, Stack, Box, Text } from '@mantine/core';

interface Activity {
  type: 'log' | 'article';
  title: string;
  createdAt: string;
}

interface RecentActivitySectionProps {
  activities: Activity[];
  formatDate: (dateString: string) => string;
}

export default function RecentActivitySection({ activities, formatDate }: RecentActivitySectionProps) {
  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      <Title order={2} fw={600} mb="md">Recent Activity</Title>
      <Stack gap="sm">
        {activities.map((activity, index) => (
          <Box key={index} py="xs">
            <Text fw={500}>
              {activity.type === 'log' ? 'Created a log' : 'Published an article'}: {activity.title}
            </Text>
            <Text size="sm" c="dimmed">{formatDate(activity.createdAt)}</Text>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
} 