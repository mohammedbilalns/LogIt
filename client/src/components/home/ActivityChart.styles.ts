export const createChartStyles = (isDark: boolean) => ({
  container: {
    height: 200,
    width: '100%',
    borderRadius: 'var(--mantine-radius-md)',
  },
  grid: {
    strokeDasharray: "3 3",
    stroke: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)',
    vertical: false,
  },
  axis: {
    stroke: isDark ? 'var(--mantine-color-dark-2)' : 'var(--mantine-color-gray-6)',
    tick: { 
      fill: isDark ? 'var(--mantine-color-dark-0)' : 'var(--mantine-color-gray-7)' 
    },
    axisLine: { 
      stroke: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)' 
    },
  },
  tooltip: {
    contentStyle: {
      backgroundColor: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
      border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
      borderRadius: 'var(--mantine-radius-md)',
      boxShadow: 'var(--mantine-shadow-md)',
    },
    labelStyle: {
      color: isDark ? 'var(--mantine-color-dark-0)' : 'var(--mantine-color-gray-9)',
      fontWeight: 500,
    },
    itemStyle: {
      color: isDark ? 'var(--mantine-color-dark-0)' : 'var(--mantine-color-gray-9)',
    },
  },
  dot: {
    r: 4,
    fill: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
    strokeWidth: 2,
  },
  activeDot: {
    r: 6,
    fill: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
    strokeWidth: 2,
  },
  chartMargin: {
    top: 10,
    right: 10,
    left: 0,
    bottom: 0,
  },
  lineConfig: {
    strokeWidth: 2,
    type: "monotone" as const,
  },
}); 