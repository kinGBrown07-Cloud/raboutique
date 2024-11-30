import { useSpring } from '@react-spring/web';
import { useState, useEffect } from 'react';

interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
}

export const useChartAnimation = (
  initialValue: number,
  targetValue: number,
  config: AnimationConfig = {}
) => {
  const {
    duration = 800,
    delay = 0,
    easing = 'ease'
  } = config;

  const [spring, api] = useSpring(() => ({
    from: { value: initialValue },
    to: { value: targetValue },
    config: {
      duration,
      delay,
      easing
    }
  }));

  useEffect(() => {
    api.start({
      from: { value: spring.value.get() },
      to: { value: targetValue }
    });
  }, [targetValue]);

  return spring;
};

export const useChartTransition = (
  show: boolean,
  config: AnimationConfig = {}
) => {
  const {
    duration = 300,
    delay = 0,
    easing = 'ease'
  } = config;

  const [spring, api] = useSpring(() => ({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: {
      opacity: show ? 1 : 0,
      transform: show ? 'scale(1)' : 'scale(0.9)'
    },
    config: {
      duration,
      delay,
      easing
    }
  }));

  useEffect(() => {
    api.start({
      to: {
        opacity: show ? 1 : 0,
        transform: show ? 'scale(1)' : 'scale(0.9)'
      }
    });
  }, [show]);

  return spring;
};
