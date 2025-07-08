import  { useState, useCallback, useMemo, useEffect, memo, useRef } from 'react';
import { MultiSelect } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTags, createTag, fetchTagsByIds } from '@/infrastructure/store/slices/tagSlice';
import { AppDispatch, RootState } from '@/infrastructure/store';
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
  const { tags, searchResults, tagNames, loading } = useSelector((state: RootState) => state.tags);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTagNames, setSelectedTagNames] = useState<Map<string, string>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    dispatch(fetchTags({ search: '', promoted: false }));
  }, [dispatch]);

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
    const allTags = [...tags, ...searchResults, ...tagNames];
    
    value.forEach(tagId => {
      const tag = allTags.find(t => t._id === tagId);
      if (tag) {
        newSelectedTagNames.set(tagId, tag.name);
      }
    });
    
    setSelectedTagNames(newSelectedTagNames);
  }, [value, tags, searchResults, tagNames]);

  useEffect(() => {
    if (inputRef.current && isDropdownOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [searchResults, isDropdownOpen]);

  const tagOptions = useMemo(() => {
    //  map of all available tags
    const allTagsMap = new Map<string, Tag>();
    
    tags.forEach((tag: Tag) => {
      allTagsMap.set(tag._id, tag);
    });
    
    searchResults.forEach((tag: Tag) => {
      allTagsMap.set(tag._id, tag);
    });
    
    tagNames.forEach((tag: Tag) => {
      if (!allTagsMap.has(tag._id)) {
        allTagsMap.set(tag._id, tag);
      }
    });

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
  }, [searchResults, tags, tagNames, value, selectedTagNames]);

  const handleTagCreate = useCallback(async (query: string) => {
    try {
      const resultAction = await dispatch(createTag(query)).unwrap();
      const newTag = { value: resultAction._id, label: resultAction.name };
      onChange([...value, newTag.value]);
      setSearchQuery('');
      return newTag;
    } catch (error: unknown) {
      console.error('Failed to create tag:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create tag. Please try again.',
        color: 'red',
      });
      throw error;
    }
  }, [dispatch, value, onChange]);

  const handleDropdownOpen = useCallback(() => {
    setIsDropdownOpen(true);
    if (!searchQuery) {
      dispatch(fetchTags({ search: '', promoted: false }));
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
      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        dispatch(fetchTags({ search: trimmedQuery, promoted: false }));
      } else {
        dispatch(fetchTags({ search: '', promoted: false }));
      }
    }, 300); 
  }, [dispatch]);

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