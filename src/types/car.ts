export interface CarBrand {
  id: string;
  name: string;
  logo_url?: string;
  created_at: string;
}

export interface CarModel {
  id: string;
  brand_id: string;
  brand?: CarBrand;
  name: string;
  variant?: string;
  year: number;
  fuel_type: string;
  body_type: string;
  created_at: string;
  current_price?: number;
  price_change?: number;
  price_change_percent?: number;
}

export interface PriceHistory {
  id: string;
  car_model_id: string;
  price: number;
  mileage: number;
  condition: string;
  recorded_at: string;
  source?: string;
  created_at: string;
}

export interface CarModelWithHistory extends CarModel {
  price_history: PriceHistory[];
}
