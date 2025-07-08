import { Paper, Stack, Title, TextInput, Group, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { SearchIcon } from '../icons/SearchIcon';
import { useMediaQuery } from '@mantine/hooks';
import { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchMaxWidth?: string;
  additionalFilters?: ReactNode;
}

export default function AdminPageHeader({
  title,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  searchMaxWidth = "400px",
  additionalFilters
}: AdminPageHeaderProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  return (
    <Paper
      shadow="xs"
      p="md"
      withBorder
      style={{
        backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
      }}
    >
      <Stack gap="md">
        <Title order={2} fw={600}>{title}</Title>
        <Group align="flex-end" wrap="wrap" gap="md">
          <TextInput
            placeholder={searchPlaceholder}
            leftSection={<SearchIcon width={16} height={16} />}
            value={searchValue}
            onChange={onSearchChange}
            style={{ 
              flexGrow: 1, 
              minWidth: isTablet ? '100%' : '300px',
              maxWidth: isTablet ? '100%' : searchMaxWidth 
            }}
            size="md"
          />
          {additionalFilters}
        </Group>
      </Stack>
    </Paper>
  );
} 