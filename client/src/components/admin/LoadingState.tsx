import { Box, Stack, Loader, Text } from '@mantine/core';

interface LoadingStateProps {
  message?: string;
  showBorder?: boolean;
  isMobile?: boolean;
}

export default function LoadingState({ 
  message = "Loading...", 
  showBorder = true,
  isMobile = false 
}: LoadingStateProps) {
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
      <Stack align="center" gap="xs">
        <Loader size="md" />
        <Text size="sm" c="dimmed">{message}</Text>
      </Stack>
    </Box>
  );
} 