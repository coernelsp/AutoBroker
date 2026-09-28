import { PointerEvent, useId, useMemo, useState } from 'react';

export interface ChartPoint {
  date: string;
  price: number;
}

interface PriceChartProps {
  points: ChartPoint[];
  trend: 'up' | 'down';
  onHoverChange: (index: number | null) => void;
}

// Vertical padding (in % of the chart height) so the line never touches the edges.
const PAD_Y = 8;

// Full-width line chart with scrubbing: moving the pointer across the chart
// reports the nearest point so the headline price can follow it.
export function PriceChart({ points, trend, onHoverChange }: PriceChartProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const coords = useMemo(() => {
    const prices = points.map((p) => p.price);
    const min = Math.min(...prices);
    const range = Math.max(...prices) - min || 1;
    const lastIndex = Math.max(points.length - 1, 1);
    return points.map((p, i) => ({
      x: (i / lastIndex) * 100,
      y: PAD_Y + (1 - (p.price - min) / range) * (100 - 2 * PAD_Y),
    }));
  }, [points]);

  if (coords.length < 2) return null;

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const area = `${line} L 100 100 L 0 100 Z`;
  const baselineY = coords[0].y;
  const active = hoverIndex != null ? coords[hoverIndex] : null;

  const updateHover = (index: number | null) => {
    setHoverIndex(index);
    onHoverChange(index);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    updateHover(Math.round(ratio * (coords.length - 1)));
  };

  return (
    <div
      className={`relative h-64 sm:h-80 touch-pan-y select-none ${trend === 'up' ? 'text-up' : 'text-down'}`}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerLeave={() => updateHover(null)}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          x2="100"
          y1={baselineY}
          y2={baselineY}
          className="stroke-muted/50"
          strokeWidth="1"
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {active && (
        <>
          <div className="pointer-events-none absolute inset-y-0 w-px bg-muted/40" style={{ left: `${active.x}%` }} />
          <div
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current ring-4 ring-bg"
            style={{ left: `${active.x}%`, top: `${active.y}%` }}
          />
        </>
      )}
    </div>
  );
}
