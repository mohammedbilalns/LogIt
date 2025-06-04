import React from 'react';
import { Paper, Text, Group, ActionIcon, useMantineColorScheme, Image, SimpleGrid, Modal } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

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
              <Text key={tag.id} size="xs" c="blue">{tag.name}</Text>
            ))}
          </Group>
        )}

        {log.mediaUrls && log.mediaUrls.length > 0 && (
          <SimpleGrid cols={2} spacing="sm">
            {log.mediaUrls.map((url, index) => (
              <button
                type="button"
                key={url}
                onClick={() => setSelectedImage(url)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: '4px',
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
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                />
              </button>
            ))}
          </SimpleGrid>
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

      <Modal
        opened={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="xl"
        centered
        padding={0}
        zIndex={2000}
        styles={{
          overlay: {
            zIndex: 2000
          },
          content: {
            zIndex: 2001
          }
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