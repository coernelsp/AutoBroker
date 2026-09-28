import { useEffect, useRef, useState } from 'react';
import { Heart, LogOut, Moon, Sun } from 'lucide-react';
import { Theme } from '../hooks/useTheme';
import { useAuth } from '../context/authContext';
import { formatRelativeTime } from '../lib/format';
import { signOut } from '../services/auth';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onHome: () => void;
  onFavorites: () => void;
  onLogin: () => void;
  isLive: boolean;
  updatedAt: string | null;
}

const iconButton =
  'flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40';

export function Header({ theme, onToggleTheme, onHome, onFavorites, onLogin, isLive, updatedAt }: HeaderProps) {
  const { user, loading, available } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <button
          type="button"
          onClick={onHome}
          className="text-lg font-bold tracking-tight focus:outline-none focus-visible:underline"
        >
          AutoBroker
        </button>

        <div className="flex items-center gap-1">
          <span className="mr-1 hidden items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted sm:flex">
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-up' : 'bg-muted'}`} />
            {isLive
              ? updatedAt
                ? `Aktualisiert ${formatRelativeTime(updatedAt)}`
                : 'Live'
              : 'Demo-Daten'}
          </span>
          <button type="button" onClick={onFavorites} aria-label="Favoriten" className={iconButton}>
            <Heart className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
            className={iconButton}
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          {available && !loading && (
            user ? (
              <AccountMenu email={user.email ?? ''} />
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="ml-1 h-9 rounded-full bg-fg px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Anmelden
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}

function AccountMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Abmelden fehlgeschlagen');
    }
  };

  return (
    <div ref={menuRef} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Konto"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40"
      >
        {email.charAt(0) || '?'}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl border border-line bg-surface p-2 shadow-2xl"
        >
          <p className="truncate px-3 py-2 text-sm text-muted">{email}</p>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-surface-2 focus:outline-none focus-visible:bg-surface-2"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
          {error && <p className="px-3 py-2 text-xs text-down">{error}</p>}
        </div>
      )}
    </div>
  );
}
