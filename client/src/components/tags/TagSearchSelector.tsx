import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MultiSelect, Loader } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchTags, fetchTagsByIds } from '@/store/slices/tagSlice';
import { useDebouncedValue } from '@mantine/hooks';

interface Tag {
  _id: string;
  name: string;
  usageCount: number;
  promoted: boolean;
}

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
  const [selectedTagNames, setSelectedTagNames] = useState<Map<string, string>>(new Map());
  const { searchResults, tagNames, loading } = useSelector((state: RootState) => state.tags);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value.length > 0) {
      const existingIds = new Set(tagNames.map(tag => tag._id));
      const missingIds = value.filter(id => !existingIds.has(id));
      
      if (missingIds.length > 0) {
        dispatch(fetchTagsByIds(missingIds));
      }
    }
  }, [value, tagNames, dispatch]);

  useEffect(() => {
    const newSelectedTagNames = new Map<string, string>();
    
    value.forEach(tagId => {
      const tag = searchResults.find(t => t._id === tagId) || tagNames.find(t => t._id === tagId);
      if (tag) {
        newSelectedTagNames.set(tagId, tag.name);
      }
    });
    
    setSelectedTagNames(newSelectedTagNames);
  }, [value, searchResults, tagNames]);

  const tagOptions = useMemo(() => {
    const allTagsMap = new Map<string, Tag>();
    
    // Add search results first
    searchResults.forEach((tag: Tag) => {
      allTagsMap.set(tag._id, tag);
    });
    
    // Add tag names (for selected tags)
    tagNames.forEach((tag: Tag) => {
      if (!allTagsMap.has(tag._id)) {
        allTagsMap.set(tag._id, tag);
      }
    });

    // Add any selected tags that might not be in the current results
    value.forEach(tagId => {
      if (!allTagsMap.has(tagId) && selectedTagNames.has(tagId)) {
        allTagsMap.set(tagId, {
          _id: tagId,
          name: selectedTagNames.get(tagId) || tagId,
          usageCount: 0,
          promoted: false
        });
      }
    });

    return Array.from(allTagsMap.values()).map((tag: Tag) => ({
      value: tag._id,
      label: tag.name
    }));
  }, [searchResults, tagNames, value, selectedTagNames]);

  const handleChange = useCallback((newValue: string[]) => {
    onChange(newValue);
    setSearchQuery('');
  }, [onChange]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        dispatch(fetchTags({ search: trimmedQuery }));
      } else {
        dispatch(fetchTags({ search: '' }));
      }
    }, 300); // 300ms debounce
  }, [dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <MultiSelect
      label={label}
      description={description}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      data={tagOptions}
      searchable
      searchValue={searchQuery}
      onSearchChange={handleSearchChange}
      disabled={disabled}
      error={error}
      clearable
      maxDropdownHeight={200}
      rightSection={loading ? <Loader size="xs" /> : null}
      comboboxProps={{ middlewares: { flip: false, shift: false } }}
    />
  );
} 