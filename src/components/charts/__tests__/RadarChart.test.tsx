import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RadarChart } from '../RadarChart';

const theme = createTheme();

describe('RadarChart', () => {
  const mockData = [
    {
      subject: 'Math',
      A: 120,
      B: 110,
      fullMark: 150,
    },
    {
      subject: 'Chinese',
      A: 98,
      B: 130,
      fullMark: 150,
    },
    {
      subject: 'English',
      A: 86,
      B: 130,
      fullMark: 150,
    },
    {
      subject: 'Geography',
      A: 99,
      B: 100,
      fullMark: 150,
    },
    {
      subject: 'Physics',
      A: 85,
      B: 90,
      fullMark: 150,
    },
    {
      subject: 'History',
      A: 65,
      B: 85,
      fullMark: 150,
    },
  ];

  const metrics = [
    { key: 'A', name: 'Student A' },
    { key: 'B', name: 'Student B' },
  ];

  const renderChart = () => {
    return render(
      <ThemeProvider theme={theme}>
        <RadarChart
          data={mockData}
          metrics={metrics}
          height={400}
          tooltipFormatter={(value) => `${value}%`}
        />
      </ThemeProvider>
    );
  };

  it('renders without crashing', () => {
    const { container } = renderChart();
    expect(container).toBeInTheDocument();
  });

  it('renders zoom controls', () => {
    renderChart();
    expect(screen.getByTitle('Zoom in')).toBeInTheDocument();
    expect(screen.getByTitle('Zoom out')).toBeInTheDocument();
    expect(screen.getByTitle('Reset')).toBeInTheDocument();
  });

  it('handles zoom controls correctly', () => {
    renderChart();
    const zoomIn = screen.getByTitle('Zoom in');
    const zoomOut = screen.getByTitle('Zoom out');
    const reset = screen.getByTitle('Reset');

    fireEvent.click(zoomIn);
    fireEvent.click(zoomOut);
    fireEvent.click(reset);
    // No errors should be thrown
  });

  it('displays correct number of data points', () => {
    const { container } = renderChart();
    const dataPoints = container.querySelectorAll('.recharts-radar');
    expect(dataPoints).toHaveLength(metrics.length);
  });
});
