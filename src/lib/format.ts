import { CarModel } from '../types/car';

const eur = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const signedEur = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
});

const signedPct = new Intl.NumberFormat('de-DE', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

export const formatPrice = (value: number) => eur.format(value);
export const formatPriceChange = (value: number) => signedEur.format(value);
export const formatPercentChange = (ratio: number) => signedPct.format(ratio);
export const formatNumber = (value: number) => value.toLocaleString('de-DE');

export function formatDate(iso: string, withYear = true) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
    ...(withYear && { year: 'numeric' }),
  });
}

export function formatRelativeTime(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat('de-DE', { numeric: 'auto' });
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  if (minutes < 60 * 24) return rtf.format(-Math.round(minutes / 60), 'hour');
  return rtf.format(-Math.round(minutes / (60 * 24)), 'day');
}

export interface PriceChange {
  absolute: number;
  ratio: number;
}

export function priceChange(from: number | null, to: number | null): PriceChange | null {
  if (from == null || to == null || from === 0) return null;
  return { absolute: to - from, ratio: (to - from) / from };
}

export type Trend = 'up' | 'down' | 'flat';

export const trendOf = (change: PriceChange | null): Trend =>
  !change || change.absolute === 0 ? 'flat' : change.absolute > 0 ? 'up' : 'down';

export const carPriceChange = (car: CarModel) => priceChange(car.previous_price, car.current_price);
