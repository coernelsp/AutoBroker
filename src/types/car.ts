export type PriceSource = 'all' | 'mobile_de' | 'ebay';

// One row of the `car_market_overview` view.
export interface CarModel {
  id: string;
  brand: string;
  name: string;
  variant: string | null;
  year: number;
  fuel_type: string;
  body_type: string;
  // Average listing price after outlier removal, null until the first snapshot.
  current_price: number | null;
  median_price: number | null;
  min_price: number | null;
  max_price: number | null;
  listing_count: number | null;
  price_updated_at: string | null;
  // Average price ~30 days ago, null if tracking started more recently.
  previous_price: number | null;
  // Prices of the last 30 days, oldest first.
  sparkline: number[];
}

export interface PriceSnapshot {
  car_model_id: string;
  source: PriceSource;
  avg_price: number;
  median_price: number;
  min_price: number;
  max_price: number;
  listing_count: number;
  avg_mileage: number | null;
  recorded_at: string;
}

export interface CarDetail {
  // Combined ('all') snapshots, oldest first.
  history: PriceSnapshot[];
  // Latest snapshot per individual source.
  sources: PriceSnapshot[];
}
