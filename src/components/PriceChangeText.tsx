import { formatPercentChange, formatPriceChange, PriceChange, trendOf } from '../lib/format';

interface PriceChangeTextProps {
  change: PriceChange | null;
  showAbsolute?: boolean;
  suffix?: string;
  className?: string;
}

const TREND_CLASS = { up: 'text-up', down: 'text-down', flat: 'text-muted' };

export function PriceChangeText({ change, showAbsolute = false, suffix, className = '' }: PriceChangeTextProps) {
  if (!change) return <span className={`text-muted ${className}`}>—</span>;

  const arrow = change.absolute > 0 ? '▲' : change.absolute < 0 ? '▼' : '';
  return (
    <span className={`tabular-nums ${TREND_CLASS[trendOf(change)]} ${className}`}>
      {arrow && <span className="mr-1 text-[0.7em]">{arrow}</span>}
      {showAbsolute && `${formatPriceChange(change.absolute)} (`}
      {formatPercentChange(change.ratio)}
      {showAbsolute && ')'}
      {suffix && <span className="ml-1.5 text-muted">{suffix}</span>}
    </span>
  );
}
