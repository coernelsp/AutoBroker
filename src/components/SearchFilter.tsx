import { Search } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedBrand: string;
  onBrandChange: (value: string) => void;
  selectedFuelType: string;
  onFuelTypeChange: (value: string) => void;
  brands: string[];
  fuelTypes: string[];
}

export function SearchFilter({
  searchTerm,
  onSearchChange,
  selectedBrand,
  onBrandChange,
  selectedFuelType,
  onFuelTypeChange,
  brands,
  fuelTypes,
}: SearchFilterProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Modell suchen..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <select
          value={selectedBrand}
          onChange={(e) => onBrandChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
        >
          <option value="">Alle Marken</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          value={selectedFuelType}
          onChange={(e) => onFuelTypeChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
        >
          <option value="">Alle Kraftstoffarten</option>
          {fuelTypes.map((fuelType) => (
            <option key={fuelType} value={fuelType}>
              {fuelType}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
