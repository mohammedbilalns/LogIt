import { useState, useEffect } from 'react';
import { MultiSelect, Loader, Text } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { searchTags } from '@/store/slices/tagSlice';
import { useDebouncedValue } from '@mantine/hooks';

interface TagSearchSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
}

export default function TagSearchSelector({
  value,
  onChange,
  placeholder = 'Search and select tags...',
  label = 'Tags',
  description,
  error,
  disabled = false
}: TagSearchSelectorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const { searchResults, loading } = useSelector((state: RootState) => state.tags);

  useEffect(() => {
    if (debouncedSearch) {
      dispatch(searchTags(debouncedSearch));
    }
  }, [debouncedSearch, dispatch]);

  const tagOptions = searchResults.map(tag => ({
    value: tag._id,
    label: tag.name
  }));

  return (
    <MultiSelect
      label={label}
      description={description}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data={tagOptions}
      searchable
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      disabled={disabled}
      error={error}
      clearable
      maxDropdownHeight={200}
      rightSection={loading ? <Loader size="xs" /> : null}
      comboboxProps={{ middlewares: { flip: false, shift: false } }}
    />
  );
} 