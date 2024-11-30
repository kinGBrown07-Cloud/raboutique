# Data Visualization Components

A collection of reusable, customizable chart components built with React, TypeScript, and various charting libraries.

## Components

### LineChart
Time-series and trend visualization component.

```tsx
import { LineChart } from './components/charts';

<LineChart
  data={[
    { timestamp: '2023-01-01', value: 10 },
    { timestamp: '2023-01-02', value: 20 }
  ]}
  lines={[
    { key: 'value', name: 'Test Value', color: '#ff0000' }
  ]}
  height={400}
  tooltipFormatter={(value) => `Value: ${value}`}
/>
```

### HeatMap
Grid-based density visualization component.

```tsx
import { HeatMap } from './components/charts';

<HeatMap
  data={[
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]}
  colors={['#fff5f7', '#ff3366']}
  cellSize={40}
  tooltipFormatter={(value) => `Value: ${value}`}
/>
```

### TreeMap
Hierarchical data visualization component.

```tsx
import { TreeMap } from './components/charts';

<TreeMap
  data={{
    name: 'root',
    children: [
      { name: 'A', size: 100 },
      { name: 'B', size: 200 }
    ]
  }}
  height={400}
  tooltipFormatter={(value) => `Size: ${value}`}
/>
```

### RadarChart
Multi-dimensional data comparison component.

```tsx
import { RadarChart } from './components/charts';

<RadarChart
  data={[
    { subject: 'A', value1: 100, value2: 80 },
    { subject: 'B', value1: 200, value2: 150 }
  ]}
  metrics={[
    { key: 'value1', name: 'Metric 1' },
    { key: 'value2', name: 'Metric 2' }
  ]}
/>
```

## Features

- TypeScript support
- Material-UI theme integration
- Responsive design
- Custom tooltips
- Interactive elements
- Configurable styles
- Accessibility support

## Testing

Run tests with:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
