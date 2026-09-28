import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CarModel, PriceSnapshot, PriceSource } from '../types/car';
import { useCarDetail } from '../hooks/useMarketData';
import { formatDate, formatNumber, formatPrice, formatRelativeTime, priceChange } from '../lib/format';
import { BrandAvatar } from './BrandAvatar';
import { FavoriteButton } from './FavoriteButton';
import { PriceChart } from './PriceChart';
import { PriceChangeText } from './PriceChangeText';

const RANGES = [
  { key: '1W', label: '1 Woche', days: 7 },
  { key: '1M', label: '1 Monat', days: 30 },
  { key: '3M', label: '3 Monate', days: 90 },
  { key: '6M', label: '6 Monate', days: 180 },
  { key: '1J', label: '1 Jahr', days: 365 },
] as const;

type RangeKey = (typeof RANGES)[number]['key'];

const SOURCES: { key: Exclude<PriceSource, 'all'>; label: string }[] = [
  { key: 'mobile_de', label: 'mobile.de' },
  { key: 'ebay', label: 'eBay' },
];

interface CarDetailViewProps {
  car: CarModel;
  onBack: () => void;
  onRequireLogin: () => void;
}

export function CarDetailView({ car, onBack, onRequireLogin }: CarDetailViewProps) {
  const { data, loading, error } = useCarDetail(car.id);
  const [range, setRange] = useState<RangeKey>('1M');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onBack();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onBack]);

  const rangeConfig = RANGES.find((r) => r.key === range)!;

  const points = useMemo(() => {
    const cutoff = Date.now() - rangeConfig.days * 24 * 60 * 60 * 1000;
    return (data?.history ?? [])
      .filter((s) => new Date(s.recorded_at).getTime() >= cutoff)
      .map((s) => ({ date: s.recorded_at, price: s.avg_price }));
  }, [data, rangeConfig]);

  const latest = data?.history[data.history.length - 1] ?? null;
  const hovered = hoverIndex != null ? points[hoverIndex] : null;
  const displayPrice = hovered?.price ?? latest?.avg_price ?? car.current_price;
  const rangeChange = points.length >= 2 ? priceChange(points[0].price, displayPrice) : null;
  const chartTrend = rangeChange && rangeChange.absolute < 0 ? 'down' : 'up';

  return (
    <article className="pb-8 pt-4">
      <div className="-mx-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Zurück"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <FavoriteButton carId={car.id} carLabel={`${car.brand} ${car.name}`} onRequireLogin={onRequireLogin} />
      </div>

      <header className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">
            {[car.variant, car.year, car.fuel_type, car.body_type].filter(Boolean).join(' · ')}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {car.brand} {car.name}
          </h1>
        </div>
        <BrandAvatar brand={car.brand} size="lg" />
      </header>

      <div className="mt-6">
        <p className="text-5xl font-semibold tracking-tight tabular-nums">
          {displayPrice != null ? formatPrice(displayPrice) : '—'}
        </p>
        <p className="mt-2 text-sm font-medium">
          <PriceChangeText
            change={rangeChange}
            showAbsolute
            suffix={hovered ? formatDate(hovered.date) : rangeConfig.label}
          />
        </p>
      </div>

      <div className="-mx-4 mt-6 sm:mx-0">
        {loading ? (
          <div className="h-64 animate-pulse bg-surface sm:h-80 sm:rounded-2xl" />
        ) : error ? (
          <div className="flex h-64 items-center justify-center px-4 text-center text-sm text-muted sm:h-80">
            Preisverlauf konnte nicht geladen werden: {error}
          </div>
        ) : points.length >= 2 ? (
          <PriceChart points={points} trend={chartTrend} onHoverChange={setHoverIndex} />
        ) : (
          <div className="flex h-64 items-center justify-center px-4 text-center text-sm text-muted sm:h-80">
            Für diesen Zeitraum liegen noch nicht genug Preisdaten vor.
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between gap-1 rounded-full bg-surface p-1" role="tablist" aria-label="Zeitraum">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            role="tab"
            aria-selected={range === r.key}
            onClick={() => setRange(r.key)}
            className={`h-9 flex-1 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40 ${
              range === r.key ? 'bg-bg text-fg shadow-sm dark:bg-surface-2' : 'text-muted hover:text-fg'
            }`}
          >
            {r.key}
          </button>
        ))}
      </div>

      {latest && <MarketStats snapshot={latest} />}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Quellen</h2>
        <ul className="mt-2 divide-y divide-line">
          {SOURCES.map(({ key, label }) => {
            const snapshot = data?.sources.find((s) => s.source === key);
            return (
              <li key={key} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted">
                    {snapshot ? `${formatNumber(snapshot.listing_count)} Inserate` : 'Keine aktuellen Daten'}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">
                  {snapshot ? formatPrice(snapshot.avg_price) : '—'}
                </p>
              </li>
            );
          })}
          <li className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">AutoScout24</p>
              <p className="text-sm text-muted">Keine öffentliche Such-API verfügbar</p>
            </div>
            <p className="font-semibold text-muted">—</p>
          </li>
        </ul>
      </section>

      {latest && (
        <p className="mt-8 text-xs leading-relaxed text-muted">
          Durchschnitt aktueller Inserate nach Entfernung von Ausreißern, aktualisiert{' '}
          {formatRelativeTime(latest.recorded_at)}. Inseratspreise sind Angebotspreise, keine
          tatsächlichen Verkaufspreise.
        </p>
      )}
    </article>
  );
}

function MarketStats({ snapshot }: { snapshot: PriceSnapshot }) {
  const stats = [
    { label: 'Durchschnitt', value: formatPrice(snapshot.avg_price) },
    { label: 'Median', value: formatPrice(snapshot.median_price) },
    { label: 'Günstigstes', value: formatPrice(snapshot.min_price) },
    { label: 'Teuerstes', value: formatPrice(snapshot.max_price) },
    { label: 'Inserate', value: formatNumber(snapshot.listing_count) },
    {
      label: 'Ø Kilometerstand',
      value: snapshot.avg_mileage != null ? `${formatNumber(snapshot.avg_mileage)} km` : '—',
    },
  ];

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Marktdaten</h2>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
