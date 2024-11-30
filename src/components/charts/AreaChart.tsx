import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme, alpha } from '@mui/material/styles';

interface DataPoint {
  timestamp: string;
  value: number;
  [key: string]: any;
}

interface AreaChartProps {
  data: DataPoint[];
  areas: {
    key: string;
    color?: string;
    name: string;
    stackId?: string;
  }[];
  height?: number | string;
  xAxisDataKey?: string;
  tooltipFormatter?: (value: any) => string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  areas,
  height = 400,
  xAxisDataKey = 'timestamp',
  tooltipFormatter
}) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey={xAxisDataKey}
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
          formatter={tooltipFormatter}
        />
        <Legend />
        {areas.map((areaConfig, index) => (
          <Area
            key={areaConfig.key}
            type="monotone"
            dataKey={areaConfig.key}
            name={areaConfig.name}
            stackId={areaConfig.stackId}
            stroke={areaConfig.color || theme.palette.primary.main}
            fill={alpha(areaConfig.color || theme.palette.primary.main, 0.2)}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;
