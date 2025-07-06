import { Group, Paper, Stack, Text, Chip, useMantineColorScheme } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { AppDispatch, RootState } from '@/store';
import { fetchTags } from '@slices/tagSlice';
import TagSearchSelector from './TagSearchSelector';

interface TagFilterSectionProps {
  selectedTags: string[];
  searchTags: string[];
  onSelectedTagsChange: (tagId: string, checked: boolean) => void;
  onSearchTagsChange: (tags: string[]) => void;
  searchLabel?: string;
  searchDescription?: string;
}

export default function TagFilterSection({
  selectedTags,
  searchTags,
  onSelectedTagsChange,
  onSearchTagsChange,
  searchLabel = 'Search Additional Tags',
  searchDescription = 'Search and select more tags to filter',
}: TagFilterSectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { promotedTags } = useSelector((state: RootState) => state.tags);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    dispatch(fetchTags({ promoted: true, limit: 5 }));
  }, [dispatch]);

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder={false}
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(12px)',
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
        boxShadow: isDark
          ? '0 2px 12px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Stack gap="sm">
        <Stack gap="xs">
          <Text fw={500} size="sm">Quick Select Tags:</Text>
          <Group gap="xs" wrap="wrap">
            {promotedTags.map((tag) => (
              <Chip
                key={tag._id}
                checked={selectedTags.includes(tag._id)}
                onChange={(checked) => onSelectedTagsChange(tag._id, checked)}
                size="xs"
                variant="light"
                color="blue"
              >
                {tag.name}
              </Chip>
            ))}
          </Group>
        </Stack>

        <TagSearchSelector
          label={searchLabel}
          description={searchDescription}
          value={searchTags}
          onChange={onSearchTagsChange}
        />
      </Stack>
    </Paper>
  );
}
