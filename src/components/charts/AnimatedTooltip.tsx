import React from 'react';
import { animated } from '@react-spring/web';
import { Box, Paper, Typography } from '@mui/material';
import { useChartTransition } from '../../hooks/useChartAnimation';

interface AnimatedTooltipProps {
  show: boolean;
  x: number;
  y: number;
  content: React.ReactNode;
  duration?: number;
  delay?: number;
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  show,
  x,
  y,
  content,
  duration = 200,
  delay = 0
}) => {
  const spring = useChartTransition(show, { duration, delay });

  if (!show) return null;

  return (
    <animated.div
      style={{
        ...spring,
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1500,
        pointerEvents: 'none'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          maxWidth: 300,
          backgroundColor: 'background.paper',
          borderRadius: 1
        }}
      >
        {typeof content === 'string' ? (
          <Typography variant="body2">{content}</Typography>
        ) : (
          content
        )}
      </Paper>
    </animated.div>
  );
};

export default AnimatedTooltip;
