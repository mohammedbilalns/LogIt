import { Paper, Stack, Group, Text, ActionIcon } from '@mantine/core';
import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  icon: ReactNode;
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Paper shadow="lg" radius="md" p="md" withBorder >
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <ActionIcon variant="light" color="blue" radius="xl" size={40}>
            {icon}
          </ActionIcon>
        </Group>
        <Text size="xl" fw={700}>
          {value}
        </Text>
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Stack>
    </Paper>
  );
} 