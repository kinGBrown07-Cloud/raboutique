import React from 'react';
import { 
  sankey, 
  sankeyLinkHorizontal, 
  sankeyCenter, 
  SankeyGraph, 
  SankeyLink, 
  SankeyNode 
} from 'd3-sankey';
import { Box, useTheme, alpha } from '@mui/material';

interface SankeyData {
  nodes: Array<{
    name: string;
    color?: string;
  }>;
  links: Array<{
    source: number;
    target: number;
    value: number;
    color?: string;
  }>;
}

interface SankeyChartProps {
  data: SankeyData;
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  tooltipFormatter?: (node: any) => string;
}

export const SankeyChart: React.FC<SankeyChartProps> = ({
  data,
  width = 960,
  height = 500,
  nodeWidth = 24,
  nodePadding = 8,
  tooltipFormatter
}) => {
  const theme = useTheme();
  const [tooltip, setTooltip] = React.useState<{
    show: boolean;
    content: string;
    x: number;
    y: number;
  }>({
    show: false,
    content: '',
    x: 0,
    y: 0
  });

  const sankeyGenerator = sankey<any, any>()
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .extent([[1, 1], [width - 1, height - 5]]);

  const { nodes, links } = sankeyGenerator({
    nodes: data.nodes.map(d => ({ ...d })),
    links: data.links.map(d => ({ ...d }))
  });

  return (
    <Box sx={{ position: 'relative', width, height }}>
      <svg width={width} height={height}>
        <g style={{ mixBlendMode: 'multiply' }}>
          {links.map((link: any, i: number) => (
            <path
              key={i}
              d={sankeyLinkHorizontal()(link) as string}
              style={{
                fill: 'none',
                strokeOpacity: 0.5,
                stroke: link.color || theme.palette.primary.main,
                strokeWidth: Math.max(1, link.width)
              }}
              onMouseEnter={(e) => {
                setTooltip({
                  show: true,
                  content: tooltipFormatter 
                    ? tooltipFormatter(link)
                    : `${link.source.name} → ${link.target.name}: ${link.value}`,
                  x: e.clientX,
                  y: e.clientY
                });
              }}
              onMouseLeave={() => {
                setTooltip({ ...tooltip, show: false });
              }}
            />
          ))}

          {nodes.map((node: any, i: number) => (
            <g
              key={i}
              transform={`translate(${node.x0},${node.y0})`}
              onMouseEnter={(e) => {
                setTooltip({
                  show: true,
                  content: tooltipFormatter 
                    ? tooltipFormatter(node)
                    : `${node.name}: ${node.value}`,
                  x: e.clientX,
                  y: e.clientY
                });
              }}
              onMouseLeave={() => {
                setTooltip({ ...tooltip, show: false });
              }}
            >
              <rect
                height={node.y1 - node.y0}
                width={node.x1 - node.x0}
                fill={node.color || theme.palette.primary.main}
                stroke={theme.palette.background.paper}
              />
              {(node.x1 - node.x0) > 70 && (
                <text
                  x={(node.x1 - node.x0) / 2}
                  y={(node.y1 - node.y0) / 2}
                  dy=".35em"
                  textAnchor="middle"
                  fontSize={12}
                  fill={theme.palette.getContrastText(node.color || theme.palette.primary.main)}
                >
                  {node.name}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>

      {tooltip.show && (
        <Box
          sx={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            padding: 1,
            borderRadius: 1,
            zIndex: 1000
          }}
        >
          {tooltip.content}
        </Box>
      )}
    </Box>
  );
};

export default SankeyChart;
