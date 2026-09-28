export interface Listing {
  price: number;
  mileage?: number;
}

export interface PriceStats {
  avg_price: number;
  median_price: number;
  min_price: number;
  max_price: number;
  listing_count: number;
  avg_mileage: number | null;
}

// Listings with fewer matches than this are too noisy to record.
export const MIN_LISTINGS = 3;

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

// Drops outliers (damaged cars, leasing rates, parts listed as cars) using
// Tukey's fences on the interquartile range.
function removeOutliers(listings: Listing[]): Listing[] {
  if (listings.length < 8) return listings;
  const prices = listings.map((l) => l.price).sort((a, b) => a - b);
  const q1 = quantile(prices, 0.25);
  const q3 = quantile(prices, 0.75);
  const iqr = q3 - q1;
  return listings.filter((l) => l.price >= q1 - 1.5 * iqr && l.price <= q3 + 1.5 * iqr);
}

export function computeStats(listings: Listing[]): PriceStats | null {
  const clean = removeOutliers(listings.filter((l) => Number.isFinite(l.price) && l.price > 0));
  if (clean.length < MIN_LISTINGS) return null;

  const prices = clean.map((l) => l.price).sort((a, b) => a - b);
  const mileages = clean.map((l) => l.mileage).filter((m): m is number => m != null);

  return {
    avg_price: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
    median_price: Math.round(quantile(prices, 0.5)),
    min_price: prices[0],
    max_price: prices[prices.length - 1],
    listing_count: prices.length,
    avg_mileage: mileages.length
      ? Math.round(mileages.reduce((sum, m) => sum + m, 0) / mileages.length)
      : null,
  };
}
