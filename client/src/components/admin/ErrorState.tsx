import { Box, Text } from '@mantine/core';

interface ErrorStateProps {
  message?: string;
  showBorder?: boolean;
}

export default function ErrorState({ 
  message = "An error occurred", 
  showBorder = true 
}: ErrorStateProps) {
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
      <Text c="red" size="sm" fw={500}>{message}</Text>
    </Box>
  );
} 