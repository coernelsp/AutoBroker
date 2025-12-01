import { CarBrand, CarModel, PriceHistory } from '../types/car';

export const mockBrands: CarBrand[] = [
  { id: '1', name: 'BMW', created_at: new Date().toISOString() },
  { id: '2', name: 'Mercedes-Benz', created_at: new Date().toISOString() },
  { id: '3', name: 'Volkswagen', created_at: new Date().toISOString() },
  { id: '4', name: 'Audi', created_at: new Date().toISOString() },
  { id: '5', name: 'Porsche', created_at: new Date().toISOString() },
];

export const mockCarModels: CarModel[] = [
  {
    id: '1',
    brand_id: '1',
    brand: mockBrands[0],
    name: '3er',
    variant: '320d',
    year: 2021,
    fuel_type: 'Diesel',
    body_type: 'Limousine',
    created_at: new Date().toISOString(),
    current_price: 32500,
    price_change: -1500,
    price_change_percent: -4.4,
  },
  {
    id: '2',
    brand_id: '1',
    brand: mockBrands[0],
    name: 'X5',
    variant: 'xDrive40d',
    year: 2022,
    fuel_type: 'Diesel',
    body_type: 'SUV',
    created_at: new Date().toISOString(),
    current_price: 58900,
    price_change: -2100,
    price_change_percent: -3.4,
  },
  {
    id: '3',
    brand_id: '2',
    brand: mockBrands[1],
    name: 'C-Klasse',
    variant: 'C200',
    year: 2021,
    fuel_type: 'Benzin',
    body_type: 'Limousine',
    created_at: new Date().toISOString(),
    current_price: 35800,
    price_change: 800,
    price_change_percent: 2.3,
  },
  {
    id: '4',
    brand_id: '2',
    brand: mockBrands[1],
    name: 'E-Klasse',
    variant: 'E300de',
    year: 2022,
    fuel_type: 'Hybrid',
    body_type: 'Limousine',
    created_at: new Date().toISOString(),
    current_price: 48500,
    price_change: -900,
    price_change_percent: -1.8,
  },
  {
    id: '5',
    brand_id: '3',
    brand: mockBrands[2],
    name: 'Golf',
    variant: 'GTI',
    year: 2023,
    fuel_type: 'Benzin',
    body_type: 'Kompakt',
    created_at: new Date().toISOString(),
    current_price: 38900,
    price_change: 1200,
    price_change_percent: 3.2,
  },
  {
    id: '6',
    brand_id: '3',
    brand: mockBrands[2],
    name: 'Tiguan',
    variant: '2.0 TDI',
    year: 2022,
    fuel_type: 'Diesel',
    body_type: 'SUV',
    created_at: new Date().toISOString(),
    current_price: 35200,
    price_change: -600,
    price_change_percent: -1.7,
  },
  {
    id: '7',
    brand_id: '4',
    brand: mockBrands[3],
    name: 'A4',
    variant: '40 TFSI',
    year: 2021,
    fuel_type: 'Benzin',
    body_type: 'Limousine',
    created_at: new Date().toISOString(),
    current_price: 36500,
    price_change: -1100,
    price_change_percent: -2.9,
  },
  {
    id: '8',
    brand_id: '4',
    brand: mockBrands[3],
    name: 'Q5',
    variant: '45 TFSI',
    year: 2022,
    fuel_type: 'Benzin',
    body_type: 'SUV',
    created_at: new Date().toISOString(),
    current_price: 52300,
    price_change: 900,
    price_change_percent: 1.8,
  },
  {
    id: '9',
    brand_id: '5',
    brand: mockBrands[4],
    name: '911',
    variant: 'Carrera',
    year: 2021,
    fuel_type: 'Benzin',
    body_type: 'Sportwagen',
    created_at: new Date().toISOString(),
    current_price: 98500,
    price_change: 3500,
    price_change_percent: 3.7,
  },
  {
    id: '10',
    brand_id: '5',
    brand: mockBrands[4],
    name: 'Cayenne',
    variant: 'S',
    year: 2022,
    fuel_type: 'Benzin',
    body_type: 'SUV',
    created_at: new Date().toISOString(),
    current_price: 89900,
    price_change: 2100,
    price_change_percent: 2.4,
  },
];

const generatePriceHistory = (basePrice: number, months: number = 12): PriceHistory[] => {
  const history: PriceHistory[] = [];
  const now = new Date();

  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);

    const volatility = Math.random() * 0.15 - 0.075;
    const trend = (months - i) * 0.005;
    const price = basePrice * (1 + volatility - trend);

    history.push({
      id: `${i}`,
      car_model_id: '',
      price: Math.round(price),
      mileage: Math.round(50000 + (months - i) * 1000),
      condition: 'Gut',
      recorded_at: date.toISOString(),
      created_at: date.toISOString(),
    });
  }

  return history;
};

export const mockPriceHistories: Record<string, PriceHistory[]> = {
  '1': generatePriceHistory(34000, 12),
  '2': generatePriceHistory(61000, 12),
  '3': generatePriceHistory(35000, 12),
  '4': generatePriceHistory(49400, 12),
  '5': generatePriceHistory(37700, 12),
  '6': generatePriceHistory(35800, 12),
  '7': generatePriceHistory(37600, 12),
  '8': generatePriceHistory(51400, 12),
  '9': generatePriceHistory(95000, 12),
  '10': generatePriceHistory(87800, 12),
};
