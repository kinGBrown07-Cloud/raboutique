import React from 'react';
import { animated } from '@react-spring/web';
import { Box } from '@mui/material';
import { useChartTransition } from '../../hooks/useChartAnimation';

interface AnimatedContainerProps {
  children: React.ReactNode;
  show?: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  show = true,
  duration,
  delay,
  easing
}) => {
  const spring = useChartTransition(show, { duration, delay, easing });

  return (
    <animated.div style={{
      ...spring,
      width: '100%',
      height: '100%'
    }}>
      <Box sx={{ width: '100%', height: '100%' }}>
        {children}
      </Box>
    </animated.div>
  );
};

export default AnimatedContainer;
