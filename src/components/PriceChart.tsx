import { useMemo } from 'react';
import { PriceHistory } from '../types/car';

interface PriceChartProps {
  data: PriceHistory[];
}

export function PriceChart({ data }: PriceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const sortedData = [...data].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

    const prices = sortedData.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const points = sortedData.map((point, index) => {
      const x = (index / (sortedData.length - 1)) * 100;
      const y = 100 - ((point.price - minPrice) / priceRange) * 100;
      return { x, y, price: point.price, date: point.recorded_at };
    });

    const pathD = points
      .map((point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`;
        }
        return `L ${point.x} ${point.y}`;
      })
      .join(' ');

    const gradientPathD = `${pathD} L 100 100 L 0 100 Z`;

    return { points, pathD, gradientPathD, sortedData, minPrice, maxPrice };
  }, [data]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Keine Daten verfügbar
      </div>
    );
  }

  const { points, pathD, gradientPathD, sortedData, minPrice, maxPrice } = chartData;

  return (
    <div className="space-y-4">
      <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border border-gray-200">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <path d={gradientPathD} fill="url(#priceGradient)" />

          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />

          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="1"
                fill="#3b82f6"
                className="hover:r-2 transition-all cursor-pointer"
              />
            </g>
          ))}
        </svg>

        <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Max</p>
          <p className="text-sm font-bold text-gray-900">
            {maxPrice.toLocaleString('de-DE')} €
          </p>
        </div>

        <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Min</p>
          <p className="text-sm font-bold text-gray-900">
            {minPrice.toLocaleString('de-DE')} €
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {sortedData.slice(-4).map((point, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
          >
            <p className="text-xs text-gray-500 mb-1">
              {new Date(point.recorded_at).toLocaleDateString('de-DE', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="text-sm font-bold text-gray-900">
              {point.price.toLocaleString('de-DE')} €
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {point.mileage.toLocaleString('de-DE')} km
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
