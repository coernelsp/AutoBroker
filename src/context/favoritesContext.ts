import { createContext, useContext } from 'react';

export interface FavoritesContextValue {
  // Favorite car ids, most recently added first.
  ids: string[];
  loading: boolean;
  error: string | null;
  // False when accounts exist but nobody is signed in.
  canSave: boolean;
  isFavorite: (carId: string) => boolean;
  toggleFavorite: (carId: string) => Promise<void>;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('useFavorites must be used within FavoritesProvider');
  return value;
}
