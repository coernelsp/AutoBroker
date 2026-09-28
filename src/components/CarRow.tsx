import { ReactNode } from 'react';
import { CarModel } from '../types/car';
import { carPriceChange, formatPrice, trendOf } from '../lib/format';
import { BrandAvatar } from './BrandAvatar';
import { PriceChangeText } from './PriceChangeText';
import { Sparkline } from './Sparkline';

interface CarRowProps {
  car: CarModel;
  onSelect: (id: string) => void;
  // Rendered next to (not inside) the row button, e.g. a favorite toggle.
  trailing?: ReactNode;
}

export function CarRow({ car, onSelect, trailing }: CarRowProps) {
  const change = carPriceChange(car);

  return (
    <li className="-mx-3 flex items-center gap-1">
      <button
        type="button"
        onClick={() => onSelect(car.id)}
        className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-surface focus:outline-none focus-visible:bg-surface"
      >
        <BrandAvatar brand={car.brand} />

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {car.brand} {car.name}
          </p>
          <p className="truncate text-sm text-muted">
            {[car.variant, car.year, car.fuel_type].filter(Boolean).join(' · ')}
          </p>
        </div>

        <Sparkline values={car.sparkline} trend={trendOf(change)} className="hidden h-8 w-24 shrink-0 sm:block" />

        <div className="shrink-0 text-right">
          <p className="font-semibold tabular-nums">
            {car.current_price != null ? formatPrice(car.current_price) : '—'}
          </p>
          <PriceChangeText change={change} className="text-sm" />
        </div>
      </button>
      {trailing}
    </li>
  );
}
