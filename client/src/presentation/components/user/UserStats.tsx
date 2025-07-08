import { Group, Text } from '@mantine/core';
import { UserPlusIcon } from '@/presentation/components/icons/UserPlusIcon';
import { FileTextIcon } from '@/presentation/components/icons/FileTextIcon';
import { UserMinusIcon } from '../icons/UserMinusIcon';

export default function UserStats({ followersCount, followingCount, articlesCount }: { followersCount: number, followingCount: number, articlesCount: number }) {
  return (
    <Group gap="md" mt="xs" mb="xs" wrap="wrap" justify="center">
      <Group gap={4}><UserPlusIcon width={18} height={18} /> <Text size="sm">{followersCount} Followers</Text></Group>
      <Group gap={4}><UserMinusIcon width={18} height={18} /> <Text size="sm">{followingCount} Following</Text></Group>
      <Group gap={4}><FileTextIcon width={18} height={18} /> <Text size="sm">{articlesCount} Articles</Text></Group>
    </Group>
  );
} 