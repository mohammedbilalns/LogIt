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
  Stack,
} from '@mantine/core';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
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
        radius="md"
        p="sm"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(16px)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
          boxShadow: isDark
            ? '0 2px 12px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Text size="md" fw={600} style={{ flex: 1, minWidth: 0 }}>
              {log.title}
            </Text>
            <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
              {formatDate(log.createdAt)}
            </Text>
          </Group>

          <Text size="sm" lineClamp={2} style={{ wordBreak: 'break-word' }}>
            {log.content}
          </Text>

          {log.tags.length > 0 && (
            <TagList tags={log.tags} />
          )}

          {log.mediaUrls?.length > 0 && (
            <SimpleGrid cols={3} spacing="xs">
              {log.mediaUrls.slice(0, 3).map((url, index) => (
                <button
                  type="button"
                  key={url}
                  onClick={() => setSelectedImage(url)}
                  style={{
                    cursor: 'pointer',
                    overflow: 'hidden',
                    borderRadius: rem(4),
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
                    height={80}
                    fit="cover"
                    radius="sm"
                    style={{
                      transition: 'transform 0.2s ease',
                    }}
                    className="log-image"
                  />
                </button>
              ))}
              {log.mediaUrls.length > 3 && (
                <div
                  style={{
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderRadius: rem(4),
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  +{log.mediaUrls.length - 3}
                </div>
              )}
            </SimpleGrid>
          )}

          {(onEdit || onDelete) && (
            <Group gap="xs" justify="flex-end">
              {onEdit && (
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => onEdit(log)}>
                  <PencilIcon width={14} />
                </ActionIcon>
              )}
              {onDelete && (
                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onDelete(log._id)}>
                  <TrashIcon width={14} />
                </ActionIcon>
              )}
            </Group>
          )}
        </Stack>
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
        {/* Recent Articles - Full Width */}
