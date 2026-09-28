import { useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { MarketOverview } from './components/MarketOverview';
import { CarDetailView } from './components/CarDetailView';
import { FavoritesPage } from './components/FavoritesPage';
import { AuthPage } from './components/AuthPage';
import { useCarModels } from './hooks/useMarketData';
import { Route, useRoute } from './hooks/useRoute';
import { useTheme } from './hooks/useTheme';
import { isLiveData } from './services/marketData';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { data: cars, loading, error } = useCarModels();
  const [route, navigate] = useRoute();

  // Page a car detail was opened from, so "back" returns there.
  const carOriginRef = useRef<Route>({ name: 'home' });

  const goHome = useCallback(() => navigate({ name: 'home' }), [navigate]);
  const goFavorites = useCallback(() => navigate({ name: 'favorites' }), [navigate]);
  // Where to land after signing in: the current page, unless we're already on an auth page.
  const returnRoute = route.name === 'login' || route.name === 'register' ? route.next : route;
  const goLogin = useCallback(() => navigate({ name: 'login', next: returnRoute }), [navigate, returnRoute]);
  const goRegister = useCallback(
    () => navigate({ name: 'register', next: returnRoute }),
    [navigate, returnRoute]
  );

  const openCar = useCallback(
    (carId: string) => {
      carOriginRef.current = route;
      navigate({ name: 'car', carId });
    },
    [navigate, route]
  );
  const closeCar = useCallback(() => navigate(carOriginRef.current), [navigate]);

  const updatedAt =
    cars?.reduce<string | null>(
      (latest, car) =>
        car.price_updated_at && (!latest || car.price_updated_at > latest) ? car.price_updated_at : latest,
      null
    ) ?? null;

  const renderPage = () => {
    switch (route.name) {
      case 'car': {
        const car = cars?.find((c) => c.id === route.carId);
        if (car) {
          return <CarDetailView key={car.id} car={car} onBack={closeCar} onRequireLogin={goLogin} />;
        }
        // Unknown id (or still loading): fall back to the overview.
        return <MarketOverview cars={cars} loading={loading} error={error} onSelect={openCar} />;
      }
      case 'favorites':
        return (
          <FavoritesPage
            cars={cars}
            carsLoading={loading}
            onSelect={openCar}
            onLogin={goLogin}
            onRegister={goRegister}
          />
        );
      case 'login':
      case 'register': {
        const next = route.next ?? { name: 'favorites' };
        return (
          <AuthPage
            key={route.name}
            mode={route.name}
            onSwitchMode={() =>
              navigate({ name: route.name === 'login' ? 'register' : 'login', next: route.next }, { replace: true })
            }
            onSuccess={() => navigate(next, { replace: true })}
          />
        );
      }
      default:
        return <MarketOverview cars={cars} loading={loading} error={error} onSelect={openCar} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onHome={goHome}
        onFavorites={goFavorites}
        onLogin={goLogin}
        isLive={isLiveData}
        updatedAt={updatedAt}
      />
      <main className="mx-auto max-w-3xl px-4 pb-16">{renderPage()}</main>
    </div>
  );
}

export default App;
