import { useCallback, useEffect, useState } from 'react';

// Pages live in the URL hash (#/auto/<id>, #/favoriten, ...) so they are
// linkable and the browser back button works.
export type Route =
  | { name: 'home' }
  | { name: 'car'; carId: string }
  | { name: 'favorites' }
  // `next` is the page to return to after signing in.
  | { name: 'login'; next?: Route }
  | { name: 'register'; next?: Route };

const AUTH_PATHS = { login: '/anmelden', register: '/registrieren' } as const;

export function routeToPath(route: Route): string {
  switch (route.name) {
    case 'home':
      return '/';
    case 'car':
      return `/auto/${encodeURIComponent(route.carId)}`;
    case 'favorites':
      return '/favoriten';
    case 'login':
    case 'register': {
      const path = AUTH_PATHS[route.name];
      return route.next ? `${path}?weiter=${encodeURIComponent(routeToPath(route.next))}` : path;
    }
  }
}

export function parsePath(fullPath: string): Route {
  const [path, query = ''] = fullPath.split('?');

  if (path.startsWith('/auto/')) {
    return { name: 'car', carId: decodeURIComponent(path.slice('/auto/'.length)) };
  }
  if (path === '/favoriten') return { name: 'favorites' };

  for (const name of ['login', 'register'] as const) {
    if (path === AUTH_PATHS[name]) {
      const next = new URLSearchParams(query).get('weiter');
      return { name, next: next?.startsWith('/') ? parsePath(next) : undefined };
    }
  }
  return { name: 'home' };
}

const readRoute = () => parsePath(window.location.hash.replace(/^#/, '') || '/');

export function useRoute() {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);

  const navigate = useCallback((next: Route, { replace = false } = {}) => {
    const path = routeToPath(next);
    const url = path === '/' ? window.location.pathname : `#${path}`;
    window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
    setRoute(next);
    window.scrollTo({ top: 0 });
  }, []);

  return [route, navigate] as const;
}
