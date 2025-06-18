import { Box, Text } from '@mantine/core';

interface EmptyStateProps {
  message?: string;
  showBorder?: boolean;
}

export default function EmptyState({ 
  message = "No items found", 
  showBorder = true 
}: EmptyStateProps) {
  return (
    <Box
      style={{
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...(showBorder && {
          borderTop: '1px solid var(--mantine-color-gray-3)'
        })
      }}
    >
      <Text c="dimmed" size="sm">{message}</Text>
    </Box>
  );
} 