import { X, Calendar, Fuel, Car, TrendingUp, TrendingDown } from 'lucide-react';
import { CarModel } from '../types/car';
import { PriceChart } from './PriceChart';
import { mockPriceHistories } from '../data/mockData';

interface CarDetailModalProps {
  car: CarModel;
  onClose: () => void;
}

export function CarDetailModal({ car, onClose }: CarDetailModalProps) {
  const priceHistory = mockPriceHistories[car.id] || [];
  const isPriceUp = (car.price_change ?? 0) > 0;
  const priceChange = car.price_change ?? 0;
  const priceChangePercent = car.price_change_percent ?? 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {car.brand?.name} {car.name}
            </h2>
            <p className="text-sm text-gray-600">{car.variant}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Baujahr</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{car.year}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Fuel className="w-4 h-4" />
                <span className="text-xs font-medium">Kraftstoff</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{car.fuel_type}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Car className="w-4 h-4" />
                <span className="text-xs font-medium">Karosserie</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{car.body_type}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                {isPriceUp ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">Trend</span>
              </div>
              <p
                className={`text-lg font-bold ${
                  isPriceUp ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {priceChangePercent > 0 ? '+' : ''}
                {priceChangePercent.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <p className="text-sm font-medium opacity-90 mb-2">Aktueller Marktwert</p>
            <p className="text-4xl font-bold mb-3">
              {car.current_price?.toLocaleString('de-DE')} €
            </p>
            <div className="flex items-center gap-2">
              {isPriceUp ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span className="text-lg font-semibold">
                {isPriceUp ? '+' : ''}
                {priceChange.toLocaleString('de-DE')} € im letzten Monat
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Preisverlauf (12 Monate)</h3>
            <PriceChart data={priceHistory} />
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Marktanalyse</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Durchschnittspreis:</span>{' '}
                {Math.round(
                  priceHistory.reduce((sum, p) => sum + p.price, 0) / priceHistory.length
                ).toLocaleString('de-DE')}{' '}
                €
              </p>
              <p>
                <span className="font-semibold">Preisspanne:</span>{' '}
                {Math.min(...priceHistory.map((p) => p.price)).toLocaleString('de-DE')} € -{' '}
                {Math.max(...priceHistory.map((p) => p.price)).toLocaleString('de-DE')} €
              </p>
              <p>
                <span className="font-semibold">Volatilität:</span>{' '}
                {isPriceUp ? 'Steigender Trend' : 'Fallender Trend'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
