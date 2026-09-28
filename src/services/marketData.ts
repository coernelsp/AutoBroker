import { supabase } from '../lib/supabase';
import { getDemoMarket } from '../data/demoData';
import { CarDetail, CarModel, PriceSnapshot } from '../types/car';

export const isLiveData = supabase !== null;

const SNAPSHOT_COLUMNS =
  'car_model_id, source, avg_price, median_price, min_price, max_price, listing_count, avg_mileage, recorded_at';

export async function fetchCarModels(): Promise<CarModel[]> {
  if (!supabase) return getDemoMarket().cars;

  const { data, error } = await supabase
    .from('car_market_overview')
    .select('*')
    .order('brand')
    .order('name');
  if (error) throw error;
  return data as CarModel[];
}

export async function fetchCarDetail(carId: string): Promise<CarDetail> {
  if (!supabase) return getDemoMarket().details[carId] ?? { history: [], sources: [] };

  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const [historyResult, sourcesResult] = await Promise.all([
    supabase
      .from('price_snapshots')
      .select(SNAPSHOT_COLUMNS)
      .eq('car_model_id', carId)
      .eq('source', 'all')
      .gte('recorded_at', since.toISOString())
      .order('recorded_at'),
    supabase
      .from('price_snapshots')
      .select(SNAPSHOT_COLUMNS)
      .eq('car_model_id', carId)
      .neq('source', 'all')
      .order('recorded_at', { ascending: false })
      .limit(10),
  ]);
  if (historyResult.error) throw historyResult.error;
  if (sourcesResult.error) throw sourcesResult.error;

  // Keep only the most recent snapshot per source.
  const latestBySource = new Map<string, PriceSnapshot>();
  for (const row of sourcesResult.data as PriceSnapshot[]) {
    if (!latestBySource.has(row.source)) latestBySource.set(row.source, row);
  }

  return {
    history: historyResult.data as PriceSnapshot[],
    sources: [...latestBySource.values()],
  };
}
