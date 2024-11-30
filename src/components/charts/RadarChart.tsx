import React, { useState, useCallback } from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { ZoomIn, ZoomOut, RestartAlt } from '@mui/icons-material';
import { AnimatedContainer } from './AnimatedContainer';
import { AnimatedTooltip } from './AnimatedTooltip';
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';

interface RadarDataPoint {
  subject: string;
  [key: string]: number | string;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  metrics: {
    key: string;
    name: string;
    color?: string;
  }[];
  height?: number | string;
  tooltipFormatter?: (value: any) => string;
  animationDuration?: number;
}

const AnimatedRadar = animated(Radar);
const AnimatedPolarGrid = animated(PolarGrid);

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  metrics,
  height = 400,
  tooltipFormatter,
  animationDuration = 800
}) => {
  const theme = useTheme();
  const [tooltipData, setTooltipData] = useState({
    show: false,
    x: 0,
    y: 0,
    content: null as React.ReactNode
  });
  
  // Zoom and rotation state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Animation spring for zoom and rotation
  const springProps = useSpring({
    scale: zoom,
    rotate: rotation,
    config: {
      mass: 1,
      tension: 170,
      friction: 26
    }
  });

  // Gesture handling for zoom and rotation
  const bind = useGesture({
    onDrag: ({ movement: [mx, my], first, memo = rotation }) => {
      if (first) return memo;
      setRotation(memo + (mx + my) / 2);
      return memo;
    },
    onPinch: ({ offset: [d] }) => {
      setZoom(Math.max(0.5, Math.min(2, d / 50)));
    }
  });

  const handleZoomIn = () => setZoom(prev => Math.min(2, prev + 0.2));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.2));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleMouseMove = useCallback((e: any) => {
    if (e.activePayload) {
      setTooltipData({
        show: true,
        x: e.clientX + 10,
        y: e.clientY - 10,
        content: (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {e.activePayload[0].payload.subject}
            </Typography>
            {e.activePayload.map((entry: any) => (
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
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: entry.stroke,
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
  }, [tooltipFormatter]);

  const handleMouseLeave = () => {
    setTooltipData(prev => ({ ...prev, show: false }));
  };

  return (
    <Box
      sx={{
        width: '100%',
        height,
        position: 'relative',
        userSelect: 'none'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          display: 'flex',
          gap: 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          borderRadius: 1,
          p: 0.5
        }}
      >
        <MuiTooltip title="Zoom in">
          <IconButton size="small" onClick={handleZoomIn}>
            <ZoomIn />
          </IconButton>
        </MuiTooltip>
        <MuiTooltip title="Zoom out">
          <IconButton size="small" onClick={handleZoomOut}>
            <ZoomOut />
          </IconButton>
        </MuiTooltip>
        <MuiTooltip title="Reset">
          <IconButton size="small" onClick={handleReset}>
            <RestartAlt />
          </IconButton>
        </MuiTooltip>
      </Box>

      <AnimatedContainer duration={animationDuration}>
        <div {...bind()} style={{ width: '100%', height: '100%' }}>
          <ResponsiveContainer>
            <RechartsRadarChart
              data={data}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <AnimatedPolarGrid
                style={{
                  transform: springProps.rotate.to(r => `rotate(${r}deg)`),
                }}
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: theme.palette.text.secondary,
                  fontSize: 12
                }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 'auto']}
                tick={{
                  fill: theme.palette.text.secondary,
                  fontSize: 12
                }}
              />
              {metrics.map((metric, index) => (
                <AnimatedRadar
                  key={metric.key}
                  name={metric.name}
                  dataKey={metric.key}
                  stroke={metric.color || theme.palette.primary.main}
                  fill={alpha(metric.color || theme.palette.primary.main, 0.2)}
                  style={{
                    transform: springProps.scale.to(s => `scale(${s})`),
                    transformOrigin: 'center',
                  }}
                  animationBegin={index * 100}
                  animationDuration={animationDuration}
                />
              ))}
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>
      </AnimatedContainer>
      <AnimatedTooltip {...tooltipData} />
    </Box>
  );
};

export default RadarChart;
