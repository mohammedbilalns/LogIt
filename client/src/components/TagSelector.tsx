import { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { MultiSelect } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTags, createTag } from '@slices/tagSlice';
import { AppDispatch, RootState } from '@/store';

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

  // Fetch tags  when component mounts
  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  const tagOptions = useMemo(() => {
    const allTags = searchResults.length > 0 ? searchResults : tags;
    return allTags.map((tag: Tag) => ({
      value: tag._id,
      label: tag.name
    }));
  }, [searchResults, tags]);

  const handleTagCreate = useCallback(async (query: string) => {
    try {
      const resultAction = await dispatch(createTag(query)).unwrap();
      const newTag = { value: resultAction._id, label: resultAction.name };
      onChange([...value, newTag.value]);
      setSearchQuery('');
      return newTag;
    } catch (error) {
      console.error('Failed to create tag:', error);
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
      handleTagCreate(searchQuery);
    }
  }, [searchQuery, tagOptions, handleTagCreate]);

  const handleChange = useCallback((newValue: string[]) => {
    
    onChange(newValue);
    setSearchQuery('');
  }, [onChange]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
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
    />
  );
}

export default memo(TagSelector); 