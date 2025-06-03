import { Paper, Text, Group, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

interface LogRowProps {
  log: {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    media?: string[];
  };
  onEdit?: (log: LogRowProps['log']) => void;
  onDelete?: (id: string) => void;
}

export default function LogRow({ log, onEdit, onDelete }: LogRowProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Invalid date string:', dateString, error);
      return 'Invalid Date';
    }
  };

  return (
    <Paper 
      p="md" 
      shadow="sm" 
      radius="md" 
      withBorder
      style={{ 
        backgroundColor: isDark ? 'var(--mantine-color-dark-7)' : 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <Group justify="space-between" align="center">
        <Text size="lg" fw={500}>{log.title}</Text>
        <Text size="sm" c="dimmed">{formatDate(log.createdAt)}</Text>
      </Group>
      
      <Text>{log.content}</Text>
      
      {log.tags && log.tags.length > 0 && (
        <Group gap="xs">
          {log.tags.map(tag => (
            <Text key={tag} size="xs" c="blue">{tag}</Text>
          ))}
        </Group>
      )}

      {(onEdit || onDelete) && (
        <Group gap="xs" justify="flex-end">
          {onEdit && (
            <ActionIcon variant="subtle" color="gray" onClick={() => onEdit(log)}>
              <IconPencil size={16} />
            </ActionIcon>
          )}
          {onDelete && (
            <ActionIcon variant="subtle" color="red" onClick={() => onDelete(log._id)}>
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      )}
    </Paper>
  );
} 