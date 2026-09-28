import { useEffect, useState } from 'react';
import { fetchCarDetail, fetchCarModels } from '../services/marketData';
import { CarDetail, CarModel } from '../types/car';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAsync<T>(load: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    load()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
        setState({ data: null, loading: false, error: message });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export const useCarModels = () => useAsync<CarModel[]>(fetchCarModels, []);

export const useCarDetail = (carId: string) =>
  useAsync<CarDetail>(() => fetchCarDetail(carId), [carId]);
