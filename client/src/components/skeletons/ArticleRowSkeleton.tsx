import { Box, Group, Paper, Skeleton } from '@mantine/core';
import React from 'react';

export default function ArticleRowSkeleton() {
  return (
    <Paper 
      shadow="sm" 
      radius="md" 
      p="md" 
      withBorder
    >
      <Group align="flex-start" wrap="nowrap">
        <Skeleton height={100} width={120} radius="md" />
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