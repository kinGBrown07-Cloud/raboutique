import React, { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { scaleLinear } from 'd3-scale';
import { AnimatedContainer } from './AnimatedContainer';
import { AnimatedTooltip } from './AnimatedTooltip';
import { animated, useSpring, useTrail } from '@react-spring/web';

interface HeatMapProps {
  data: number[][];
  width?: number;
  height?: number;
  colors?: string[];
  cellSize?: number;
  padding?: number;
  tooltipFormatter?: (value: number) => string;
  animationDuration?: number;
}

const AnimatedRect = animated('rect');

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  width = 500,
  height = 500,
  colors = ['#fff5f7', '#ff3366'],
  cellSize = 40,
  padding = 2,
  tooltipFormatter = (value: number) => `${value}`,
  animationDuration = 800
}) => {
  const theme = useTheme();
  const [tooltipData, setTooltipData] = useState({
    show: false,
    x: 0,
    y: 0,
    content: null as React.ReactNode
  });
  const [hoveredCell, setHoveredCell] = useState<number[]>([]);

  // Calculate color scale
  const colorScale = scaleLinear<string>()
    .domain([0, Math.max(...data.flat())])
    .range(colors as any);

  // Create trail animation for cells
  const flatData = data.flat();
  const trail = useTrail(flatData.length, {
    from: { opacity: 0, scale: 0 },
    to: { opacity: 1, scale: 1 },
    config: {
      mass: 1,
      tension: 280,
      friction: 60
    },
    delay: 200
  });

  const handleMouseEnter = (value: number, rowIndex: number, colIndex: number) => (e: React.MouseEvent) => {
    setHoveredCell([rowIndex, colIndex]);
    setTooltipData({
      show: true,
      x: e.clientX + 10,
      y: e.clientY - 10,
      content: (
        <Box sx={{ p: 1 }}>
          <Box sx={{ color: 'text.secondary', mb: 0.5 }}>
            Position: [{rowIndex}, {colIndex}]
          </Box>
          <Box sx={{ fontWeight: 'bold' }}>
            {tooltipFormatter(value)}
          </Box>
        </Box>
      )
    });
  };

  const handleMouseLeave = () => {
    setHoveredCell([]);
    setTooltipData(prev => ({ ...prev, show: false }));
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <AnimatedContainer duration={animationDuration}>
        <svg width={width} height={height}>
          {data.map((row, rowIndex) =>
            row.map((value, colIndex) => {
              const index = rowIndex * row.length + colIndex;
              const isHovered = hoveredCell[0] === rowIndex && hoveredCell[1] === colIndex;
              
              const springProps = useSpring({
                to: {
                  scale: isHovered ? 1.1 : 1,
                  shadow: isHovered ? 0.3 : 0,
                },
                config: {
                  tension: 300,
                  friction: 20
                }
              });

              return (
                <AnimatedRect
                  key={`${rowIndex}-${colIndex}`}
                  x={colIndex * (cellSize + padding)}
                  y={rowIndex * (cellSize + padding)}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  style={{
                    fill: colorScale(value),
                    opacity: trail[index].opacity,
                    transform: trail[index].scale
                      .to(s => springProps.scale.to(
                        hover => `scale(${s * hover})`
                      )),
                    filter: springProps.shadow.to(
                      s => s > 0 ? `drop-shadow(0 0 ${s * 8}px rgba(0,0,0,0.3))` : 'none'
                    ),
                    transformOrigin: `${colIndex * (cellSize + padding) + cellSize/2}px ${rowIndex * (cellSize + padding) + cellSize/2}px`
                  }}
                  onMouseEnter={handleMouseEnter(value, rowIndex, colIndex)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })
          )}
        </svg>
      </AnimatedContainer>
      <AnimatedTooltip {...tooltipData} />
    </Box>
  );
};

export default HeatMap;
