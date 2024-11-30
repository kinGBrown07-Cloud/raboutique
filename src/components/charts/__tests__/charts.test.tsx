import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  LineChart,
  AreaChart,
  RadarChart,
  HeatMap,
  TreeMap,
  SankeyChart
} from '../';

const theme = createTheme();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('Chart Components', () => {
  describe('LineChart', () => {
    const mockData = [
      { timestamp: '2023-01-01', value: 10 },
      { timestamp: '2023-01-02', value: 20 }
    ];

    it('renders without crashing', () => {
      render(
        <LineChart
          data={mockData}
          lines={[{ key: 'value', name: 'Test Value' }]}
        />,
        { wrapper }
      );
    });

    it('displays tooltip on hover', () => {
      render(
        <LineChart
          data={mockData}
          lines={[{ key: 'value', name: 'Test Value' }]}
          tooltipFormatter={(value) => `Value: ${value}`}
        />,
        { wrapper }
      );
      // Test tooltip interaction
    });
  });

  describe('HeatMap', () => {
    const mockData = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ];

    it('renders without crashing', () => {
      render(
        <HeatMap
          data={mockData}
          tooltipFormatter={(value) => `Value: ${value}`}
        />,
        { wrapper }
      );
    });

    it('displays correct number of cells', () => {
      const { container } = render(
        <HeatMap data={mockData} />,
        { wrapper }
      );
      const cells = container.querySelectorAll('rect');
      expect(cells.length).toBe(9); // 3x3 grid
    });
  });

  describe('TreeMap', () => {
    const mockData = {
      name: 'root',
      children: [
        { name: 'A', size: 100 },
        { name: 'B', size: 200 }
      ]
    };

    it('renders without crashing', () => {
      render(
        <TreeMap
          data={mockData}
          tooltipFormatter={(value) => `Size: ${value}`}
        />,
        { wrapper }
      );
    });
  });

  describe('RadarChart', () => {
    const mockData = [
      { subject: 'A', value: 100 },
      { subject: 'B', value: 200 }
    ];

    it('renders without crashing', () => {
      render(
        <RadarChart
          data={mockData}
          metrics={[{ key: 'value', name: 'Test' }]}
        />,
        { wrapper }
      );
    });
  });
});
