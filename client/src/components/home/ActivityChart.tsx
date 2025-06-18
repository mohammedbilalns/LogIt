import { Box, Group, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IconFileText } from '@tabler/icons-react';
import { createChartStyles } from './ActivityChart.styles';

interface ChartDataItem {
  date: string;
  logs: number;
  articles: number;
}

interface ActivityChartProps {
  data: ChartDataItem[];
  onNewLog: () => void;
  onWriteArticle: () => void;
}

export default function ActivityChart({ data, onNewLog, onWriteArticle }: ActivityChartProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createChartStyles(isDark);

  const chartData = data.map(item => ({
    day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    logs: item.logs,
    articles: item.articles
  }));

  return (
    <>
      <Box style={styles.container}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={styles.chartMargin}>
            <CartesianGrid {...styles.grid} />
            <XAxis dataKey="day" {...styles.axis} />
            <YAxis {...styles.axis} />
            <Tooltip {...styles.tooltip} />
            <Line
              {...styles.lineConfig}
              dataKey="logs"
              stroke="var(--mantine-color-blue-6)"
              dot={styles.dot}
              activeDot={styles.activeDot}
            />
            <Line
              {...styles.lineConfig}
              dataKey="articles"
              stroke="var(--mantine-color-green-6)"
              dot={styles.dot}
              activeDot={styles.activeDot}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Group mt="md" justify="space-between">
        <Button 
          variant="default" 
          leftSection={<IconFileText size={18} />} 
          onClick={onNewLog}
        >
          New Log
        </Button>
        <Button 
          variant="default" 
          leftSection={<IconFileText size={18} />} 
          onClick={onWriteArticle}
        >
          Write Article
        </Button>
      </Group>
    </>
  );
} 