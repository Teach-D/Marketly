interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

const CHART_PADDING = { top: 16, right: 8, bottom: 40, left: 56 };

export default function BarChart({ data, color = '#3b82f6', height = 200, formatValue }: BarChartProps) {
  if (!data.length) return <p style={{ color: '#9ca3af', textAlign: 'center' }}>데이터 없음</p>;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const innerW = Math.max(data.length * 28, 400);
  const innerH = height - CHART_PADDING.top - CHART_PADDING.bottom;
  const svgW = innerW + CHART_PADDING.left + CHART_PADDING.right;
  const svgH = height;
  const barW = Math.max(Math.min(innerW / data.length - 4, 24), 8);

  const yTicks = 4;
  const fmt = formatValue ?? ((v: number) => v.toLocaleString());

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={svgW} height={svgH} style={{ display: 'block' }}>
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const ratio = i / yTicks;
          const y = CHART_PADDING.top + innerH * (1 - ratio);
          const tickVal = Math.round(maxVal * ratio);
          return (
            <g key={i}>
              <line x1={CHART_PADDING.left} x2={svgW - CHART_PADDING.right} y1={y} y2={y} stroke='#e5e7eb' strokeWidth={1} />
              <text x={CHART_PADDING.left - 6} y={y + 4} textAnchor='end' fontSize={10} fill='#9ca3af'>
                {fmt(tickVal)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = CHART_PADDING.left + (innerW / data.length) * i + (innerW / data.length - barW) / 2;
          const barH = (d.value / maxVal) * innerH;
          const y = CHART_PADDING.top + innerH - barH;
          const labelX = x + barW / 2;

          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barW} height={Math.max(barH, 1)} fill={color} rx={2} opacity={0.85} />
              <text
                x={labelX}
                y={svgH - CHART_PADDING.bottom + 14}
                textAnchor='middle'
                fontSize={9}
                fill='#6b7280'
                transform={`rotate(-45, ${labelX}, ${svgH - CHART_PADDING.bottom + 14})`}
              >
                {d.label.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
