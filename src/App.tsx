import { useState, useMemo } from 'react';
import { TrendingUp, Car, DollarSign, BarChart3 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StatsCard } from './components/StatsCard';
import { SearchFilter } from './components/SearchFilter';
import { CarCard } from './components/CarCard';
import { CarDetailModal } from './components/CarDetailModal';
import { mockCarModels } from './data/mockData';
import { CarModel } from './types/car';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [selectedCar, setSelectedCar] = useState<CarModel | null>(null);

  const brands = useMemo(
    () => Array.from(new Set(mockCarModels.map((car) => car.brand?.name || ''))).sort(),
    []
  );

  const fuelTypes = useMemo(
    () => Array.from(new Set(mockCarModels.map((car) => car.fuel_type))).sort(),
    []
  );

  const filteredCars = useMemo(() => {
    return mockCarModels.filter((car) => {
      const matchesSearch =
        searchTerm === '' ||
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.variant?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand = selectedBrand === '' || car.brand?.name === selectedBrand;
      const matchesFuelType = selectedFuelType === '' || car.fuel_type === selectedFuelType;

      return matchesSearch && matchesBrand && matchesFuelType;
    });
  }, [searchTerm, selectedBrand, selectedFuelType]);

  const stats = useMemo(() => {
    const totalCars = mockCarModels.length;
    const avgPrice =
      mockCarModels.reduce((sum, car) => sum + (car.current_price || 0), 0) / totalCars;
    const totalGainers = mockCarModels.filter((car) => (car.price_change || 0) > 0).length;

    return {
      totalCars,
      avgPrice: Math.round(avgPrice),
      totalGainers,
      gainerPercentage: ((totalGainers / totalCars) * 100).toFixed(0),
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">
            Übersicht der aktuellen Autopreise und Markttrends
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Verfügbare Modelle"
            value={stats.totalCars.toString()}
            icon={Car}
          />
          <StatsCard
            title="Durchschnittspreis"
            value={`${stats.avgPrice.toLocaleString('de-DE')} €`}
            icon={DollarSign}
          />
          <StatsCard
            title="Steigende Preise"
            value={`${stats.totalGainers} Modelle`}
            change={`${stats.gainerPercentage}% der Modelle`}
            changeType="positive"
            icon={TrendingUp}
          />
          <StatsCard
            title="Marktaktivität"
            value="Live"
            change="Echtzeit-Daten"
            changeType="neutral"
            icon={BarChart3}
          />
        </div>

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          selectedFuelType={selectedFuelType}
          onFuelTypeChange={setSelectedFuelType}
          brands={brands}
          fuelTypes={fuelTypes}
        />

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {filteredCars.length} {filteredCars.length === 1 ? 'Modell' : 'Modelle'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} onClick={() => setSelectedCar(car)} />
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Modelle gefunden
            </h3>
            <p className="text-gray-600">
              Versuche deine Suchkriterien anzupassen
            </p>
          </div>
        )}
      </main>

      {selectedCar && (
        <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  );
}

export default App;
