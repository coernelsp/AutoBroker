import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { addFavorite, fetchFavoriteIds, removeFavorite } from '../services/favorites';
import { useAuth } from './authContext';
import { FavoritesContext } from './favoritesContext';

const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Favoriten konnten nicht gespeichert werden.';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, available: authAvailable } = useAuth();
  const canSave = !authAvailable || user !== null;

  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reload whenever the signed-in user changes.
  useEffect(() => {
    if (authLoading) return;
    if (!canSave) {
      setIds([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFavoriteIds()
      .then((result) => !cancelled && setIds(result))
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [authLoading, canSave, user?.id]);

  const toggleFavorite = useCallback(
    async (carId: string) => {
      if (!canSave) return;
      const wasFavorite = ids.includes(carId);

      // Optimistic update, rolled back if the request fails.
      setIds((current) =>
        wasFavorite ? current.filter((id) => id !== carId) : [carId, ...current]
      );
      setError(null);
      try {
        await (wasFavorite ? removeFavorite(carId) : addFavorite(carId));
      } catch (err) {
        setIds((current) =>
          wasFavorite ? [carId, ...current] : current.filter((id) => id !== carId)
        );
        setError(errorMessage(err));
      }
    },
    [canSave, ids]
  );

  const value = useMemo(
    () => ({
      ids,
      loading: loading || authLoading,
      error,
      canSave,
      isFavorite: (carId: string) => ids.includes(carId),
      toggleFavorite,
    }),
    [ids, loading, authLoading, error, canSave, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
