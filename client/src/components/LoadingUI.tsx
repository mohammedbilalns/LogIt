import { Center, Stack, Text } from '@mantine/core';

export function LoadingUI() {
  return (
    <Center h="100vh" style={{ backgroundColor: '#fff' }}>
      <Stack align="center" gap="xs">
        <div
          style={{
            display: 'inline-block',
            position: 'relative',
            width: 80,
            height: 80,
          }}
        >
          {[0, -0.4, -0.8].map((delay, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#228be6',
                top: 32,
                left: 8 + index * 24,
                animation: 'dots-loader 1.2s linear infinite',
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
        <Text size="sm" c="dimmed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Loading...
        </Text>
      </Stack>

      <style>
        {`
          @keyframes dots-loader {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(0.7);
            }
          }
        `}
      </style>
    </Center>
  );
} 