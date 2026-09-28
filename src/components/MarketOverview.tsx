import { ReactNode, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { CarModel } from '../types/car';
import { carPriceChange, formatPrice } from '../lib/format';
import { BrandAvatar } from './BrandAvatar';
import { CarRow } from './CarRow';
import { PriceChangeText } from './PriceChangeText';

type SortKey = 'name' | 'price' | 'change';

const SORT_LABELS: Record<SortKey, string> = {
  name: 'Name',
  price: 'Preis',
  change: 'Veränderung',
};

interface MarketOverviewProps {
  cars: CarModel[] | null;
  loading: boolean;
  error: string | null;
  onSelect: (id: string) => void;
}

export function MarketOverview({ cars, loading, error, onSelect }: MarketOverviewProps) {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState<string | null>(null);
  const [fuel, setFuel] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('name');

  const allCars = useMemo(() => cars ?? [], [cars]);
  const brands = useMemo(() => [...new Set(allCars.map((c) => c.brand))].sort(), [allCars]);
  const fuels = useMemo(() => [...new Set(allCars.map((c) => c.fuel_type))].sort(), [allCars]);

  const market = useMemo(() => {
    const priced = allCars.filter((c) => c.current_price != null);
    const changes = allCars.map(carPriceChange).filter((c) => c != null);
    const avgPrice = priced.reduce((sum, c) => sum + c.current_price!, 0) / (priced.length || 1);
    const avgRatio = changes.reduce((sum, c) => sum + c.ratio, 0) / (changes.length || 1);
    const movers = allCars
      .filter((c) => carPriceChange(c))
      .sort((a, b) => Math.abs(carPriceChange(b)!.ratio) - Math.abs(carPriceChange(a)!.ratio))
      .slice(0, 4);
    return {
      avgPrice: priced.length ? Math.round(avgPrice) : null,
      // Only the ratio is displayed; `absolute` just carries the sign.
      avgChange: changes.length ? { absolute: avgRatio, ratio: avgRatio } : null,
      rising: changes.filter((c) => c.absolute > 0).length,
      falling: changes.filter((c) => c.absolute < 0).length,
      movers,
    };
  }, [allCars]);

  const visibleCars = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = allCars.filter(
      (car) =>
        (!brand || car.brand === brand) &&
        (!fuel || car.fuel_type === fuel) &&
        (!query ||
          `${car.brand} ${car.name} ${car.variant ?? ''} ${car.body_type}`.toLowerCase().includes(query))
    );
    const byChange = (c: CarModel) => carPriceChange(c)?.ratio ?? -Infinity;
    return filtered.sort((a, b) => {
      if (sort === 'price') return (b.current_price ?? 0) - (a.current_price ?? 0);
      if (sort === 'change') return byChange(b) - byChange(a);
      return `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, 'de');
    });
  }, [allCars, search, brand, fuel, sort]);

  if (error) {
    return (
      <div className="mt-10 rounded-2xl bg-surface p-6">
        <p className="font-semibold">Marktdaten konnten nicht geladen werden</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
      </div>
    );
  }

  return (
    <>
      <section className="pb-8 pt-10">
        <p className="text-sm font-medium text-muted">Ø Marktpreis · {allCars.length} Modelle</p>
        {loading ? (
          <div className="mt-2 h-12 w-64 animate-pulse rounded-lg bg-surface" />
        ) : (
          <>
            <h1 className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
              {market.avgPrice != null ? formatPrice(market.avgPrice) : '—'}
            </h1>
            <p className="mt-2 text-sm">
              <PriceChangeText change={market.avgChange} suffix="30 Tage" />
              <span className="ml-3 text-muted">
                {market.rising} steigend · {market.falling} fallend
              </span>
            </p>
          </>
        )}
      </section>

      {market.movers.length > 0 && (
        <section className="pb-8">
          <h2 className="mb-3 text-lg font-semibold">Größte Bewegungen</h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {market.movers.map((car) => (
              <button
                key={car.id}
                type="button"
                onClick={() => onSelect(car.id)}
                className="flex w-40 shrink-0 flex-col items-start gap-3 rounded-2xl bg-surface p-4 text-left transition-colors hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40"
              >
                <BrandAvatar brand={car.brand} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {car.brand} {car.name}
                  </p>
                  <PriceChangeText change={carPriceChange(car)} className="text-sm font-medium" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen"
              aria-label="Modell suchen"
              className="h-11 w-full rounded-full bg-surface pl-10 pr-4 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-fg/30"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sortieren nach"
            className="h-11 rounded-full bg-surface px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fg/30"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="-mx-4 mb-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <Chip active={!brand && !fuel} onClick={() => { setBrand(null); setFuel(null); }}>
            Alle
          </Chip>
          {brands.map((b) => (
            <Chip key={b} active={brand === b} onClick={() => setBrand(brand === b ? null : b)}>
              {b}
            </Chip>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-line" />
          {fuels.map((f) => (
            <Chip key={f} active={fuel === f} onClick={() => setFuel(fuel === f ? null : f)}>
              {f}
            </Chip>
          ))}
        </div>

        {loading ? (
          <ul className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                <div className="h-11 w-11 animate-pulse rounded-full bg-surface" />
                <div className="h-10 flex-1 animate-pulse rounded-lg bg-surface" />
              </li>
            ))}
          </ul>
        ) : visibleCars.length > 0 ? (
          <ul>
            {visibleCars.map((car) => (
              <CarRow key={car.id} car={car} onSelect={onSelect} />
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center">
            <p className="font-semibold">Keine Modelle gefunden</p>
            <p className="mt-1 text-sm text-muted">Passe Suche oder Filter an.</p>
          </div>
        )}
      </section>
    </>
  );
}

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40 ${
        active ? 'bg-fg text-bg' : 'bg-surface text-fg hover:bg-surface-2'
      }`}
    >
      {children}
    </button>
  );
}
