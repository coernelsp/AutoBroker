import { Heart } from 'lucide-react';
import { useFavorites } from '../context/favoritesContext';

interface FavoriteButtonProps {
  carId: string;
  carLabel: string;
  // Called instead of saving when the user has to sign in first.
  onRequireLogin: () => void;
}

export function FavoriteButton({ carId, carLabel, onRequireLogin }: FavoriteButtonProps) {
  const { canSave, isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(carId);

  return (
    <button
      type="button"
      onClick={() => (canSave ? toggleFavorite(carId) : onRequireLogin())}
      aria-pressed={active}
      aria-label={active ? `${carLabel} aus Favoriten entfernen` : `${carLabel} zu Favoriten hinzufügen`}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40"
    >
      <Heart className={`h-5 w-5 transition-colors ${active ? 'fill-down text-down' : 'text-muted'}`} />
    </button>
  );
}
