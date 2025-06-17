import { Group, Select, Text } from '@mantine/core';
import { useMemo } from 'react';

interface SortOption {
  value: string;
  label: string;
}

interface SortByProps {
  value: string;
  onChange: (value: string | null) => void;
  options?: SortOption[];
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function SortBy({ 
  value, 
  onChange, 
  options, 
  label = 'Sort By:', 
  size = 'xs' 
}: SortByProps) {
  const defaultOptions = useMemo(() => [
    { value: 'new', label: 'New To Old' },
    { value: 'old', label: 'Old To New' },
  ], []);

  const sortOptions = options || defaultOptions;

  return (
    <Group>
      <Text fw={500}>{label}</Text>
      <Select
        data={sortOptions}
        value={value}
        onChange={onChange}
        size={size}
        radius="md"
        checkIconPosition="right"
      />
    </Group>
  );
} 