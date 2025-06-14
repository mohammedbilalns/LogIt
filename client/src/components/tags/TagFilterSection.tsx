import { Group, Paper, Stack, Text, Chip } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { AppDispatch, RootState } from '@/store';
import { fetchPromotedAndUserTags } from '@slices/tagSlice';
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
  searchLabel = "Search Additional Tags",
  searchDescription = "Search and select more tags to filter",
}: TagFilterSectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { tags } = useSelector((state: RootState) => state.tags);

  useEffect(() => {
    dispatch(fetchPromotedAndUserTags({ limit: 5 }));
  }, [dispatch]);

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Stack gap="xs">
          <Text fw={500}>Quick Select Tags:</Text>
          <Group gap="xs" wrap="wrap">
            {tags.map((tag) => (
              <Chip
                key={tag._id}
                checked={selectedTags.includes(tag._id)}
                onChange={(checked) => onSelectedTagsChange(tag._id, checked)}
                size="sm"
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