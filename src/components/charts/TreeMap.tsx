import React, { useState, useMemo } from 'react';
import {
  Treemap as RechartsTreemap,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { AnimatedContainer } from './AnimatedContainer';
import { AnimatedTooltip } from './AnimatedTooltip';
import { useChartAnimation } from '../../hooks/useChartAnimation';
import { animated, useSpring } from '@react-spring/web';

interface TreeNode {
  name: string;
  size?: number;
  children?: TreeNode[];
  color?: string;
}

interface TreeMapProps {
  data: TreeNode;
  height?: number | string;
  tooltipFormatter?: (value: any) => string;
  colorScale?: string[];
  animationDuration?: number;
}

const COLORS = [
  '#8889DD',
  '#9597E4',
  '#8DC77B',
  '#A5D297',
  '#E2CF45',
  '#F8C12D'
];

const AnimatedRect = animated('rect');

const CustomizedContent: React.FC<any> = ({
  root,
  depth,
  x,
  y,
  width,
  height,
  index,
  name,
  value,
  colors,
  onHover
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  const spring = useSpring({
    to: {
      opacity: isHovered ? 1 : 0.8,
      scale: isHovered ? 1.02 : 1,
    },
    config: { tension: 300, friction: 20 }
  });

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    onHover?.({
      show: true,
      x: e.clientX,
      y: e.clientY,
      content: (
        <Box>
          <Typography variant="subtitle2" color="text.primary">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Valeur: {value}
          </Typography>
        </Box>
      )
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.({ show: false });
  };

  return (
    <g
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatedRect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: alpha(color, spring.opacity),
          stroke: theme.palette.background.paper,
          strokeWidth: 2,
          strokeOpacity: 1,
          transform: spring.scale.to(s => `scale(${s})`),
          transformOrigin: `${x + width/2}px ${y + height/2}px`
        }}
        rx={2}
      />
      {width > 50 && height > 30 && (
        <animated.g style={{
          opacity: spring.opacity,
          transform: spring.scale.to(s => `scale(${s})`),
          transformOrigin: `${x + width/2}px ${y + height/2}px`
        }}>
          <text
            x={x + width / 2}
            y={y + height / 2 - 7}
            textAnchor="middle"
            fill={theme.palette.getContrastText(color)}
            fontSize={12}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill={theme.palette.getContrastText(color)}
            fontSize={10}
          >
            {value}
          </text>
        </animated.g>
      )}
    </g>
  );
};

export const TreeMap: React.FC<TreeMapProps> = ({
  data,
  height = 400,
  tooltipFormatter,
  colorScale = COLORS,
  animationDuration = 800
}) => {
  const theme = useTheme();
  const [tooltipData, setTooltipData] = useState({
    show: false,
    x: 0,
    y: 0,
    content: null as React.ReactNode
  });

  return (
    <Box sx={{ width: '100%', height }}>
      <AnimatedContainer duration={animationDuration}>
        <ResponsiveContainer>
          <RechartsTreemap
            data={[data]}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke={theme.palette.background.paper}
            fill={theme.palette.primary.main}
            content={<CustomizedContent colors={colorScale} onHover={setTooltipData} />}
          />
        </ResponsiveContainer>
      </AnimatedContainer>
      <AnimatedTooltip {...tooltipData} />
    </Box>
  );
};

export default TreeMap;
