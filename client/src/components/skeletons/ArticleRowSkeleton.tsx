import { Box, Group, Paper, Skeleton, useMantineColorScheme } from '@mantine/core';
import React from 'react';

export default function ArticleRowSkeleton() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Paper
      radius="lg" // Reduced from md
      p="md"
      withBorder={false}
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
        boxShadow: isDark
          ? '0 4px 24px rgba(0,0,0,0.5)'
          : '0 4px 16px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Group align="flex-start" wrap="nowrap">
        <Skeleton height={100} width={120} radius="sm" />
        <Box style={{ flex: 1 }}>
          <Skeleton height={24} width="70%" mb={8} />
          <Skeleton height={16} width="30%" mb={12} />
          <Skeleton height={40} width="100%" mb={12} />
          <Group gap="xs">
            <Skeleton height={24} width={60} radius="xl" />
            <Skeleton height={24} width={80} radius="xl" />
            <Skeleton height={24} width={70} radius="xl" />
          </Group>
          <Skeleton height={16} width="20%" mt={8} />
        </Box>
      </Group>
    </Paper>
  );
}
