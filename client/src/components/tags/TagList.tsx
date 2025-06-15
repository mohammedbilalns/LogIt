import { Chip, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface Tag {
  id?: string;
  name: string;
}

interface TagListProps {
  tags: Tag[];
  maxVisible?: number;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function TagList({ 
  tags, 
  maxVisible = 5, 
  color = 'blue',
  size = 'xs'
}: TagListProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const displayLimit = isMobile ? Math.min(3, maxVisible) : maxVisible;

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Group gap="xs" style={{ flexWrap: 'wrap' }}>
      {tags.slice(0, displayLimit).map(tag => (
        <Chip 
          key={tag.id || tag.name} 
          size={size} 
          checked 
          readOnly 
          variant="light" 
          color={color}
        >
          {tag.name}
        </Chip>
      ))}
      {tags.length > displayLimit && (
        <Chip 
          size={size} 
          variant="light" 
          color={color}
          disabled
        >
          +{tags.length - displayLimit} more
        </Chip>
      )}
    </Group>
  );
} 