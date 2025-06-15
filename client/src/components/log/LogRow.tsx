import React, { useState } from 'react';
import {
  Paper,
  Text,
  Group,
  ActionIcon,
  useMantineColorScheme,
  Image,
  SimpleGrid,
  Modal,
  rem,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import TagList from '../tags/TagList';

interface Tag {
  id: string;
  name: string;
}

interface LogRowProps {
  log: {
    _id: string;
    title: string;
    content: string;
    tags: Tag[];
    createdAt: string;
    mediaUrls: string[];
  };
  onEdit?: (log: LogRowProps['log']) => void;
  onDelete?: (id: string) => void;
}

export default function LogRow({ log, onEdit, onDelete }: LogRowProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    <>
      <Paper
        radius="lg"
        p="md"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(16px)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.5)'
            : '0 4px 16px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: rem(8),
        }}
      >
        <Group justify="space-between" align="center">
          <Text size="lg" fw={600}>
            {log.title}
          </Text>
          <Text size="sm" c="dimmed">
            {formatDate(log.createdAt)}
          </Text>
        </Group>

        <Text>{log.content}</Text>

        <TagList tags={log.tags} />

        {log.mediaUrls?.length > 0 && (
          <SimpleGrid cols={2} spacing="sm">
            {log.mediaUrls.map((url, index) => (
              <button
                type="button"
                key={url}
                onClick={() => setSelectedImage(url)}
                style={{
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: rem(6),
                  border: 'none',
                  padding: 0,
                  background: 'none',
                  width: '100%',
                }}
                aria-label={`View full size image ${index + 1}`}
              >
                <Image
                  src={url}
                  alt={`Media ${index + 1}`}
                  height={200}
                  fit="cover"
                  radius="sm"
                  style={{
                    transition: 'transform 0.2s ease',
                  }}
                  className="log-image"
                />
              </button>
            ))}
          </SimpleGrid>
        )}

        {(onEdit || onDelete) && (
          <Group gap="xs" justify="flex-end" mt="xs">
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

      <Modal
        opened={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="xl"
        centered
        padding={0}
        zIndex={2000}
        styles={{
          overlay: { zIndex: 2000 },
          content: { zIndex: 2001 },
        }}
      >
        {selectedImage && (
          <Image
            src={selectedImage}
            alt="Full size media"
            fit="contain"
            style={{ maxHeight: '80vh' }}
          />
        )}
      </Modal>
    </>
  );
}
