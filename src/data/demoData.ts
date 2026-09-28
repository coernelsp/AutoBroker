// Deterministic demo market used when Supabase isn't configured. It mirrors the
// shape of the live data (daily snapshots per source) so the UI behaves the same.

import { CarDetail, CarModel, PriceSnapshot, PriceSource } from '../types/car';

interface DemoCar {
  brand: string;
  name: string;
  variant: string;
  year: number;
  fuel_type: string;
  body_type: string;
  price: number;
  // Approximate price trend over 30 days, e.g. -0.04 = -4 %.
  monthlyTrend: number;
}

const DEMO_CARS: DemoCar[] = [
  { brand: 'BMW', name: '3er', variant: '320d', year: 2021, fuel_type: 'Diesel', body_type: 'Limousine', price: 32500, monthlyTrend: -0.044 },
  { brand: 'BMW', name: 'X5', variant: 'xDrive40d', year: 2022, fuel_type: 'Diesel', body_type: 'SUV', price: 58900, monthlyTrend: -0.034 },
  { brand: 'Mercedes-Benz', name: 'C-Klasse', variant: 'C200', year: 2021, fuel_type: 'Benzin', body_type: 'Limousine', price: 35800, monthlyTrend: 0.023 },
  { brand: 'Mercedes-Benz', name: 'E-Klasse', variant: 'E300de', year: 2022, fuel_type: 'Hybrid', body_type: 'Limousine', price: 48500, monthlyTrend: -0.018 },
  { brand: 'Volkswagen', name: 'Golf', variant: 'GTI', year: 2023, fuel_type: 'Benzin', body_type: 'Kompakt', price: 38900, monthlyTrend: 0.032 },
  { brand: 'Volkswagen', name: 'Tiguan', variant: '2.0 TDI', year: 2022, fuel_type: 'Diesel', body_type: 'SUV', price: 35200, monthlyTrend: -0.017 },
  { brand: 'Audi', name: 'A4', variant: '40 TFSI', year: 2021, fuel_type: 'Benzin', body_type: 'Limousine', price: 36500, monthlyTrend: -0.029 },
  { brand: 'Audi', name: 'Q5', variant: '45 TFSI', year: 2022, fuel_type: 'Benzin', body_type: 'SUV', price: 52300, monthlyTrend: 0.017 },
  { brand: 'Porsche', name: '911', variant: 'Carrera', year: 2021, fuel_type: 'Benzin', body_type: 'Sportwagen', price: 98500, monthlyTrend: 0.037 },
  { brand: 'Porsche', name: 'Cayenne', variant: 'S', year: 2022, fuel_type: 'Benzin', body_type: 'SUV', price: 89900, monthlyTrend: 0.024 },
];

const HISTORY_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

// Small seeded PRNG (mulberry32) so demo charts are stable across reloads.
function createRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function snapshot(
  carId: string,
  source: PriceSource,
  avg: number,
  count: number,
  mileage: number,
  recordedAt: Date
): PriceSnapshot {
  return {
    car_model_id: carId,
    source,
    avg_price: Math.round(avg),
    median_price: Math.round(avg * 0.985),
    min_price: Math.round(avg * 0.78),
    max_price: Math.round(avg * 1.24),
    listing_count: count,
    avg_mileage: mileage,
    recorded_at: recordedAt.toISOString(),
  };
}

function generateHistory(carId: string, car: DemoCar, random: () => number): PriceSnapshot[] {
  const today = new Date();
  today.setHours(6, 0, 0, 0);

  // Random walk backwards from today's price so the series ends exactly there.
  // The trend reverses a few times over the year to make ranges look different.
  const dailyTrend = car.monthlyTrend / 30;
  const prices: number[] = [car.price];
  for (let day = 1; day < HISTORY_DAYS; day++) {
    const phase = Math.sin((day / HISTORY_DAYS) * Math.PI * 3);
    const drift = day <= 30 ? dailyTrend : dailyTrend * 0.4 + phase * 0.0012;
    const noise = (random() - 0.5) * 0.006;
    prices.push(prices[day - 1] / (1 + drift + noise));
  }
  prices.reverse();

  const baseMileage = (2026 - car.year) * 14000;
  return prices.map((price, i) => {
    const date = new Date(today.getTime() - (HISTORY_DAYS - 1 - i) * DAY_MS);
    const count = Math.round(60 + random() * 90);
    return snapshot(carId, 'all', price, count, Math.round(baseMileage + random() * 8000), date);
  });
}

interface DemoMarket {
  cars: CarModel[];
  details: Record<string, CarDetail>;
}

function buildDemoMarket(): DemoMarket {
  const cars: CarModel[] = [];
  const details: Record<string, CarDetail> = {};

  DEMO_CARS.forEach((car, index) => {
    const id = `demo-${index + 1}`;
    const random = createRandom(index + 1);
    const history = generateHistory(id, car, random);
    const latest = history[history.length - 1];
    const monthAgo = history[history.length - 31];
    const recordedAt = new Date(latest.recorded_at);

    const mobileShare = 0.65 + random() * 0.15;
    const sources = [
      snapshot(id, 'mobile_de', latest.avg_price * (1 + (random() - 0.5) * 0.03), Math.round(latest.listing_count * mobileShare), latest.avg_mileage ?? 0, recordedAt),
      snapshot(id, 'ebay', latest.avg_price * (1 + (random() - 0.5) * 0.06), Math.round(latest.listing_count * (1 - mobileShare)), latest.avg_mileage ?? 0, recordedAt),
    ];

    cars.push({
      id,
      brand: car.brand,
      name: car.name,
      variant: car.variant,
      year: car.year,
      fuel_type: car.fuel_type,
      body_type: car.body_type,
      current_price: latest.avg_price,
      median_price: latest.median_price,
      min_price: latest.min_price,
      max_price: latest.max_price,
      listing_count: latest.listing_count,
      price_updated_at: latest.recorded_at,
      previous_price: monthAgo.avg_price,
      sparkline: history.slice(-30).map((s) => s.avg_price),
    });
    details[id] = { history, sources };
  });

  return { cars, details };
}

let demoMarket: DemoMarket | null = null;

export function getDemoMarket(): DemoMarket {
  demoMarket ??= buildDemoMarket();
  return demoMarket;
}
