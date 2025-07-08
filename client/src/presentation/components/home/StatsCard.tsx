import { Paper, Group, Text, ActionIcon } from '@mantine/core';
import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  icon: ReactNode;
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Paper shadow="sm" radius="md" p="sm" withBorder>
      <Group gap="sm" align="center">
        <ActionIcon variant="light" color="blue" radius="md" size={36}>
            {icon}
          </ActionIcon>
        <div style={{ flex: 1 }}>
          <Text size="lg" fw={700} lh={1.2}>
          {value}
        </Text>
          <Text size="xs" c="dimmed" lh={1.2}>
          {label}
        </Text>
        </div>
      </Group>
    </Paper>
  );
} 