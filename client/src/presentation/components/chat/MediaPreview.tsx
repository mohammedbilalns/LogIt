import React from 'react';
import { Box, Group, Text, ActionIcon, Image, useMantineColorScheme } from '@mantine/core';
import { XIcon } from '../icons/XIcon';
import { AudioPlayer } from './AudioPlayer';

interface MediaPreviewProps {
  media: { file: File; type: 'image' | 'audio' };
  onRemove: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ media, onRemove }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box
      p="xs"
      style={{
        background: isDark ? 'rgba(40, 44, 52, 0.95)' : '#f8f9fa',
        border: isDark ? '1px solid #343a40' : '1px solid #dee2e6',
        borderRadius: 14,
        marginBottom: 10,
        boxShadow: isDark
          ? '0 2px 8px rgba(40,44,52,0.18)'
          : '0 2px 8px rgba(34,139,230,0.08)',
        maxWidth: 420,
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="md" align="center" wrap="nowrap">
          {media.type === 'image' ? (
            <Image
              src={URL.createObjectURL(media.file)}
              alt="Preview"
              width={96}
              height={96}
              radius={12}
              fit="cover"
              style={{ boxShadow: isDark ? '0 2px 8px #23272e' : '0 2px 8px #dee2e6', border: isDark ? '1px solid #23272e' : '1px solid #dee2e6', background: isDark ? '#23272e' : '#fff' }}
            />
          ) : (
            <AudioPlayer src={URL.createObjectURL(media.file)} fileName={media.file.name} size={media.file.size} compact previewWidth={220} />
          )}
          <Box style={{ minWidth: 0 }}>
            {media.type === 'image' && (
              <>
                <Text size="sm" fw={600} truncate style={{ maxWidth: 180, color: isDark ? '#fff' : '#222' }}>
                  {media.file.name}
                </Text>
                <Text size="xs" c={isDark ? 'gray.4' : 'dimmed'}>
                  {getFileSize(media.file.size)}
                </Text>
              </>
            )}
            {media.type === 'audio' && (
              <Text size="xs" c={isDark ? 'gray.4' : 'dimmed'}>
                {getFileSize(media.file.size)}
              </Text>
            )}
          </Box>
        </Group>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={onRemove}
          size="md"
        >
          <XIcon width={18} height={18} />
        </ActionIcon>
      </Group>
    </Box>
  );
}; 