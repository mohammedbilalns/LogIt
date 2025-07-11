import { useState, useMemo, useEffect } from 'react';
import {
  Paper,
  Stack,
  Title,
  Group,
  SimpleGrid,
  Select,
  Button,
  useMantineTheme,
  useMantineColorScheme,
  Box,
  Text,
  Divider,
} from '@mantine/core';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import { UsersIcon } from '@/presentation/components/icons/UsersIcon';
import { FileTextIcon } from '@/presentation/components/icons/FileTextIcon';
import { NotesIcon } from '@/presentation/components/icons/NotesIcon';
import { ChartBarIcon } from '@/presentation/components/icons/ChartBarIcon';
import { CalendarIcon } from '@/presentation/components/icons/CalendarIcon';
import { DashboardIcon } from '@/presentation/components/icons/DashboardIcon';
import StatsCard from '@/presentation/components/home/StatsCard';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import dayjs from 'dayjs';
import AdminPageContainer from '@/presentation/components/admin/AdminPageContainer';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/infrastructure/store';
import {
  fetchDashboardStats,
  fetchDashboardChartData,
  selectDashboardStats,
  selectUserJoinedChartData,
  selectArticleSharedChartData,
  selectDashboardLoading,
  selectDashboardError,
} from '@/infrastructure/store/slices/dashboardSlice';

type UserAnalytics = { date: string; users: number };
type ArticleAnalytics = { date: string; articles: number };

type DateFilter = 'daily' | 'monthly' | 'yearly' | 'custom';

type ChartType = 'line' | 'bar';

const dateFilterOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

function filterDataByDate<T extends { date: string }>(
  data: T[],
  filter: DateFilter,
  customRange: DatesRangeValue<Date | null>
): T[] {
  if (filter === 'custom' && customRange[0] && customRange[1]) {
    const [start, end] = customRange;
    return data.filter((d) => dayjs(d.date).isAfter(dayjs(start).subtract(1, 'day')) && dayjs(d.date).isBefore(dayjs(end).add(1, 'day')));
  }
  return data;
}

type ChartTypeToggleProps = {
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
};

function ChartTypeToggle({ chartType, setChartType }: ChartTypeToggleProps) {
  return (
    <Group gap="xs">
      <Button
        variant={chartType === 'line' ? 'filled' : 'light'}
        size="xs"
        leftSection={<DashboardIcon width={16} />}
        onClick={() => setChartType('line')}
      >
        Line
      </Button>
      <Button
        variant={chartType === 'bar' ? 'filled' : 'light'}
        size="xs"
        leftSection={<ChartBarIcon width={16} />}
        onClick={() => setChartType('bar')}
      >
        Bar
      </Button>
    </Group>
  );
}

const getDateValue = (val: unknown) => {
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') {
    const d = new Date(val);
    return !isNaN(d.getTime()) ? d.toISOString() : undefined;
  }
  return undefined;
};

export default function AdminDashboard() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const dispatch = useDispatch<AppDispatch>();

  // Filters
  const [userDateFilter, setUserDateFilter] = useState<DateFilter>('daily');
  const [userCustomRange, setUserCustomRange] = useState<DatesRangeValue<Date | null>>([null, null]);
  const [userChartType, setUserChartType] = useState<ChartType>('line');

  const [articleDateFilter, setArticleDateFilter] = useState<DateFilter>('daily');
  const [articleCustomRange, setArticleCustomRange] = useState<DatesRangeValue<Date | null>>([null, null]);
  const [articleChartType, setArticleChartType] = useState<ChartType>('line');

  const stats = useSelector(selectDashboardStats);
  const userJoinedChartData = useSelector(selectUserJoinedChartData);
  const articleSharedChartData = useSelector(selectArticleSharedChartData);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    if (userDateFilter === 'custom' && (!userCustomRange[0] || !userCustomRange[1])) return;
    const startDate = userDateFilter === 'custom' ? getDateValue(userCustomRange[0]) : undefined;
    const endDate = userDateFilter === 'custom' ? getDateValue(userCustomRange[1]) : undefined;
    dispatch(
      fetchDashboardChartData({
        type: 'user-joined',
        granularity: userDateFilter === 'custom' ? 'daily' : userDateFilter,
        startDate,
        endDate,
      })
    );
  }, [dispatch, userDateFilter, userCustomRange]);

  useEffect(() => {
    if (articleDateFilter === 'custom' && (!articleCustomRange[0] || !articleCustomRange[1])) return;
    const startDate = articleDateFilter === 'custom' ? getDateValue(articleCustomRange[0]) : undefined;
    const endDate = articleDateFilter === 'custom' ? getDateValue(articleCustomRange[1]) : undefined;
    dispatch(
      fetchDashboardChartData({
        type: 'article-shared',
        granularity: articleDateFilter === 'custom' ? 'daily' : articleDateFilter,
        startDate,
        endDate,
      })
    );
  }, [dispatch, articleDateFilter, articleCustomRange]);

  const userAnalyticsData = userJoinedChartData ? userJoinedChartData.data : [];
  const articleAnalyticsData = articleSharedChartData ? articleSharedChartData.data : [];

  const handleUserDateFilterChange = (value: string | null) => {
    setUserDateFilter((value as DateFilter) || 'daily');
  };
  const handleArticleDateFilterChange = (value: string | null) => {
    setArticleDateFilter((value as DateFilter) || 'daily');
  };
  const handleUserCustomRangeChange = (value: DatesRangeValue<Date | null>) => {
    setUserCustomRange(value);
  };
  const handleArticleCustomRangeChange = (value: DatesRangeValue<Date | null>) => {
    setArticleCustomRange(value);
  };

  return (
    <AdminPageContainer>
      <Stack gap="lg">
        <Title order={2} mb="sm">Admin Dashboard</Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <StatsCard label="Total Users" value={stats?.totalUsers?.toLocaleString() ?? '-'} icon={<UsersIcon width={24} />} />
          <StatsCard label="Total Articles" value={stats?.totalArticles?.toLocaleString() ?? '-'} icon={<FileTextIcon width={24} />} />
          <StatsCard label="Total Logs" value={stats?.totalLogs?.toLocaleString() ?? '-'} icon={<NotesIcon width={24} />} />
        </SimpleGrid>

        {/* User Analytics Chart */}
        <Paper shadow="xs" p="md" withBorder>
          <Group justify="space-between" align="center" mb="sm">
            <Group gap="xs">
              <Title order={4} fw={600}>User Joined Analytics</Title>
              <CalendarIcon width={18} />
            </Group>
            <Group gap="xs">
              <Select
                data={dateFilterOptions}
                value={userDateFilter}
                onChange={handleUserDateFilterChange}
                size="xs"
                style={{ minWidth: 110 }}
              />
              {userDateFilter === 'custom' && (
                <DatePickerInput
                  type="range"
                  value={userCustomRange as any}
                  onChange={handleUserCustomRangeChange as any}
                  size="xs"
                  style={{ minWidth: 220 }}
                  placeholder="Pick range"
                  label="Custom date range"
                />
              )}
              <ChartTypeToggle chartType={userChartType} setChartType={setUserChartType} />
            </Group>
          </Group>
          <Divider mb="sm" />
          <Box style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              {userChartType === 'line' ? (
                <LineChart data={userAnalyticsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke={theme.colors.blue[6]} strokeWidth={2} />
                </LineChart>
              ) : (
                <BarChart data={userAnalyticsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={theme.colors.blue[6]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Article Analytics Chart */}
        <Paper shadow="xs" p="md" withBorder>
          <Group justify="space-between" align="center" mb="sm">
            <Group gap="xs">
              <Title order={4} fw={600}>Article Shared Analytics</Title>
              <CalendarIcon width={18} />
            </Group>
            <Group gap="xs">
              <Select
                data={dateFilterOptions}
                value={articleDateFilter}
                onChange={handleArticleDateFilterChange}
                size="xs"
                style={{ minWidth: 110 }}
              />
              {articleDateFilter === 'custom' && (
                <DatePickerInput
                  type="range"
                  value={articleCustomRange as any}
                  onChange={handleArticleCustomRangeChange as any}
                  size="xs"
                  style={{ minWidth: 220 }}
                  placeholder="Pick range"
                  label="Custom date range"
                />
              )}
              <ChartTypeToggle chartType={articleChartType} setChartType={setArticleChartType} />
            </Group>
          </Group>
          <Divider mb="sm" />
          <Box style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              {articleChartType === 'line' ? (
                <LineChart data={articleAnalyticsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke={theme.colors.green[6]} strokeWidth={2} />
                </LineChart>
              ) : (
                <BarChart data={articleAnalyticsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={theme.colors.green[6]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Box>
        </Paper>
        {loading && <Text ta="center">Loading...</Text>}
        {error && <Text ta="center" color="red">{error}</Text>}
      </Stack>
    </AdminPageContainer>
  );
} 