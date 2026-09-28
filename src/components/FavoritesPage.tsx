import { Heart } from 'lucide-react';
import { CarModel } from '../types/car';
import { useAuth } from '../context/authContext';
import { useFavorites } from '../context/favoritesContext';
import { carPriceChange, formatPrice, priceChange } from '../lib/format';
import { CarRow } from './CarRow';
import { FavoriteButton } from './FavoriteButton';
import { PriceChangeText } from './PriceChangeText';

interface FavoritesPageProps {
  cars: CarModel[] | null;
  carsLoading: boolean;
  onSelect: (id: string) => void;
  onLogin: () => void;
  onRegister: () => void;
}

export function FavoritesPage({ cars, carsLoading, onSelect, onLogin, onRegister }: FavoritesPageProps) {
  const { available: authAvailable } = useAuth();
  const { ids, loading, error, canSave } = useFavorites();

  if (!canSave) {
    return (
      <div className="mx-auto max-w-sm pt-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface">
          <Heart className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Deine Favoriten</h1>
        <p className="mt-2 text-muted">
          Melde dich an, um Modelle zu speichern und ihre Preise auf einen Blick zu verfolgen.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onLogin}
            className="h-12 rounded-full bg-fg font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Anmelden
          </button>
          <button
            type="button"
            onClick={onRegister}
            className="h-12 rounded-full bg-surface font-semibold transition-colors hover:bg-surface-2"
          >
            Konto erstellen
          </button>
        </div>
      </div>
    );
  }

  const byId = new Map((cars ?? []).map((car) => [car.id, car]));
  const favorites = ids.map((id) => byId.get(id)).filter((car): car is CarModel => car != null);

  // Combined value of all favorites today vs. ~30 days ago (where both are known).
  const withChange = favorites.filter((car) => carPriceChange(car));
  const totalNow = withChange.reduce((sum, car) => sum + car.current_price!, 0);
  const totalBefore = withChange.reduce((sum, car) => sum + car.previous_price!, 0);
  const totalPrice = favorites.reduce((sum, car) => sum + (car.current_price ?? 0), 0);

  const isLoading = loading || carsLoading;

  return (
    <>
      <section className="pb-8 pt-10">
        <p className="text-sm font-medium text-muted">
          Gesamtwert · {isLoading ? '…' : `${favorites.length} ${favorites.length === 1 ? 'Favorit' : 'Favoriten'}`}
        </p>
        {isLoading ? (
          <div className="mt-2 h-12 w-64 animate-pulse rounded-lg bg-surface" />
        ) : (
          <>
            <h1 className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
              {favorites.length ? formatPrice(totalPrice) : '—'}
            </h1>
            <p className="mt-2 text-sm">
              <PriceChangeText change={priceChange(totalBefore || null, totalNow || null)} showAbsolute suffix="30 Tage" />
            </p>
          </>
        )}
        {!authAvailable && (
          <p className="mt-4 text-xs text-muted">Demo-Modus: Favoriten werden nur in diesem Browser gespeichert.</p>
        )}
      </section>

      {error && (
        <p role="alert" className="mb-4 rounded-2xl bg-surface p-4 text-sm text-down">
          {error}
        </p>
      )}

      {isLoading ? (
        <ul className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="flex items-center gap-4 py-3">
              <div className="h-11 w-11 animate-pulse rounded-full bg-surface" />
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-surface" />
            </li>
          ))}
        </ul>
      ) : favorites.length > 0 ? (
        <ul>
          {favorites.map((car) => (
            <CarRow
              key={car.id}
              car={car}
              onSelect={onSelect}
              trailing={
                <FavoriteButton carId={car.id} carLabel={`${car.brand} ${car.name}`} onRequireLogin={onLogin} />
              }
            />
          ))}
        </ul>
      ) : (
        <div className="py-16 text-center">
          <p className="font-semibold">Noch keine Favoriten</p>
          <p className="mt-1 text-sm text-muted">
            Tippe auf das Herz bei einem Modell, um es hier zu speichern.
          </p>
        </div>
      )}
    </>
  );
}
