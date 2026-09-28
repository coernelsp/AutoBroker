import { Trend } from '../lib/format';

interface SparklineProps {
  values: number[];
  trend: Trend;
  className?: string;
}

const TREND_CLASS = { up: 'text-up', down: 'text-down', flat: 'text-muted' };

export function Sparkline({ values, trend, className = '' }: SparklineProps) {
  if (values.length < 2) return <div className={className} />;

  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 4 + (1 - (v - min) / range) * 22;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className={`${TREND_CLASS[trend]} ${className}`}
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
