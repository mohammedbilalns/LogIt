import { Stack, Flex, Select, Pagination, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface ResponsivePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: string | null) => void;
  pageSizeOptions?: Array<{ value: string; label: string }>;
  label?: string;
  placeholder?: string;
}

export default function ResponsivePagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
  ],
  label = "Page size",
  placeholder = "Page size"
}: ResponsivePaginationProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Stack gap="md" mt="md">
      <Flex 
        justify="space-between" 
        align="center" 
        wrap="wrap" 
        gap="md"
        direction={isMobile ? "column" : "row"}
      >
        <Select
          label={isMobile ? undefined : label}
          placeholder={isMobile ? placeholder : undefined}
          value={pageSize.toString()}
          onChange={onPageSizeChange}
          data={pageSizeOptions}
          style={{ width: isMobile ? '100%' : '150px' }}
          size={isMobile ? 'sm' : 'md'}
        />
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={onPageChange}
          withEdges
          size={isMobile ? 'sm' : 'md'}
        />
      </Flex>
    </Stack>
  );
} 