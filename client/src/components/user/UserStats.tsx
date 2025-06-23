import { Group, Text } from '@mantine/core';
import { IconUserPlus, IconUserMinus, IconFileText } from '@tabler/icons-react';

export default function UserStats({ followersCount, followingCount, articlesCount }: { followersCount: number, followingCount: number, articlesCount: number }) {
  return (
    <Group gap="md" mt="xs" mb="xs" wrap="wrap" justify="center">
      <Group gap={4}><IconUserPlus size={18} /> <Text size="sm">{followersCount} Followers</Text></Group>
      <Group gap={4}><IconUserMinus size={18} /> <Text size="sm">{followingCount} Following</Text></Group>
      <Group gap={4}><IconFileText size={18} /> <Text size="sm">{articlesCount} Articles</Text></Group>
    </Group>
  );
} 