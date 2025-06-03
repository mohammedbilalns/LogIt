import { useState, useCallback, useMemo, useEffect, memo, useRef } from 'react';
import { MultiSelect } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTags, createTag, searchTags } from '@slices/tagSlice';
import { AppDispatch, RootState } from '@/store';
import { notifications } from '@mantine/notifications';

interface Tag {
  _id: string;
  name: string;
  usageCount: number;
  promoted: boolean;
}

interface TagSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

function TagSelector({ value, onChange }: TagSelectorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { tags, searchResults, loading } = useSelector((state: RootState) => state.tags);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTagNames, setSelectedTagNames] = useState<Map<string, string>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch tags when component mounts
  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  // Update selected tag names 
  useEffect(() => {
    const newSelectedTagNames = new Map<string, string>();
    const allTags = [...tags, ...searchResults];
    
    value.forEach(tagId => {
      const tag = allTags.find(t => t._id === tagId);
      if (tag) {
        newSelectedTagNames.set(tagId, tag.name);
      }
    });
    
    setSelectedTagNames(newSelectedTagNames);
  }, [value, tags, searchResults]);

  // Maintain focus after search results update
  useEffect(() => {
    if (inputRef.current && isDropdownOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [searchResults, isDropdownOpen]);

  const tagOptions = useMemo(() => {
    // Create a map of all available tags
    const allTagsMap = new Map<string, Tag>();
    
    // Add all tags from the main tags list
    tags.forEach((tag: Tag) => {
      allTagsMap.set(tag._id, tag);
    });
    
    // Add or update with search results
    searchResults.forEach((tag: Tag) => {
      allTagsMap.set(tag._id, tag);
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

    // Convert the map to an array of options
    return Array.from(allTagsMap.values()).map((tag: Tag) => ({
      value: tag._id,
      label: tag.name
    }));
  }, [searchResults, tags, value, selectedTagNames]);

  const handleTagCreate = useCallback(async (query: string) => {
    try {
      const resultAction = await dispatch(createTag(query)).unwrap();
      const newTag = { value: resultAction._id, label: resultAction.name };
      onChange([...value, newTag.value]);
      setSearchQuery('');
      return newTag;
    } catch (error: any) {
      console.error('Failed to create tag:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create tag. Please try again.',
        color: 'red',
      });
      throw error;
    }
  }, [dispatch, value, onChange]);

  const handleDropdownOpen = useCallback(() => {
    setIsDropdownOpen(true);
    if (!searchQuery) {
      dispatch(fetchTags());
    }
  }, [dispatch, searchQuery]);

  const handleDropdownClose = useCallback(() => {
    setIsDropdownOpen(false);
    setSearchQuery('');
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchQuery && !tagOptions.some(tag => tag.label.toLowerCase() === searchQuery.toLowerCase())) {
      event.preventDefault();
      handleTagCreate(searchQuery).catch(() => {
      });
    }
  }, [searchQuery, tagOptions, handleTagCreate]);

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
      if (query.trim()) {
        dispatch(searchTags(query));
      } else {
        dispatch(fetchTags());
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
      label="Tags"
      placeholder="Search or create tags"
      data={tagOptions}
      value={value}
      onChange={handleChange}
      searchable
      searchValue={searchQuery}
      onSearchChange={handleSearchChange}
      nothingFoundMessage="Press Enter to create a new tag"
      clearable
      onDropdownOpen={handleDropdownOpen}
      onDropdownClose={handleDropdownClose}
      onKeyDown={handleKeyDown}
      disabled={loading}
      maxDropdownHeight={300}
      dropdownOpened={isDropdownOpen}
      ref={inputRef}
    />
  );
}

export default memo(TagSelector); 