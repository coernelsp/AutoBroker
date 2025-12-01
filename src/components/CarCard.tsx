import { TrendingUp, TrendingDown, Calendar, Fuel, Car } from 'lucide-react';
import { CarModel } from '../types/car';

interface CarCardProps {
  car: CarModel;
  onClick: () => void;
}

export function CarCard({ car, onClick }: CarCardProps) {
  const isPriceUp = (car.price_change ?? 0) > 0;
  const priceChange = car.price_change ?? 0;
  const priceChangePercent = car.price_change_percent ?? 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {car.brand?.name} {car.name}
            </h3>
          </div>
          <p className="text-sm text-gray-600">{car.variant}</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
          <Car className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar className="w-3.5 h-3.5" />
          <span>{car.year}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Fuel className="w-3.5 h-3.5" />
          <span>{car.fuel_type}</span>
        </div>
        <div className="text-gray-600">
          <span>{car.body_type}</span>
        </div>
      </div>

      <div className="flex items-end justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {car.current_price?.toLocaleString('de-DE')} €
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {isPriceUp ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-sm font-semibold ${
                isPriceUp ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPriceUp ? '+' : ''}
              {priceChange.toLocaleString('de-DE')} € ({priceChangePercent > 0 ? '+' : ''}
              {priceChangePercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
