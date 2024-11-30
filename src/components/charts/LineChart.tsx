import React, { useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { AnimatedContainer } from './AnimatedContainer';
import { AnimatedTooltip } from './AnimatedTooltip';
import { useChartAnimation } from '../../hooks/useChartAnimation';

interface DataPoint {
  timestamp: string;
  value: number;
  [key: string]: any;
}

interface LineChartProps {
  data: DataPoint[];
  lines: {
    key: string;
    color?: string;
    name: string;
  }[];
  height?: number | string;
  xAxisDataKey?: string;
  tooltipFormatter?: (value: any) => string;
  animationDuration?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  height = 400,
  xAxisDataKey = 'timestamp',
  tooltipFormatter,
  animationDuration = 800
}) => {
  const theme = useTheme();
  const [tooltipData, setTooltipData] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({
    show: false,
    x: 0,
    y: 0,
    content: null
  });

  const handleMouseMove = (e: any) => {
    if (e.activePayload) {
      setTooltipData({
        show: true,
        x: e.clientX + 10,
        y: e.clientY - 10,
        content: (
          <Box>
            <Box sx={{ mb: 1, color: 'text.secondary' }}>
              {e.activePayload[0].payload[xAxisDataKey]}
            </Box>
            {e.activePayload.map((entry: any, index: number) => (
              <Box
                key={entry.dataKey}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                    mr: 1
                  }}
                />
                <Box sx={{ mr: 1 }}>{entry.name}:</Box>
                <Box sx={{ fontWeight: 'bold' }}>
                  {tooltipFormatter
                    ? tooltipFormatter(entry.value)
                    : entry.value}
                </Box>
              </Box>
            ))}
          </Box>
        )
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltipData(prev => ({ ...prev, show: false }));
  };

  return (
    <Box sx={{ width: '100%', height }}>
      <AnimatedContainer duration={animationDuration}>
        <ResponsiveContainer>
          <RechartsLineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
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
            <Legend />
            {lines.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color || theme.palette.primary.main}
                activeDot={{ r: 8 }}
                dot={false}
                animationDuration={animationDuration}
                animationBegin={index * 200}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </AnimatedContainer>
      <AnimatedTooltip {...tooltipData} />
    </Box>
  );
};

export default LineChart;
