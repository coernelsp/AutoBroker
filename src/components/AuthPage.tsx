import { FormEvent, useState } from 'react';
import { Eye, EyeOff, MailCheck } from 'lucide-react';
import { isAuthAvailable, signIn, signUp } from '../services/auth';

const MIN_PASSWORD_LENGTH = 8;

interface AuthPageProps {
  mode: 'login' | 'register';
  onSwitchMode: () => void;
  onSuccess: () => void;
}

export function AuthPage({ mode, onSwitchMode, onSuccess }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);

  const isRegister = mode === 'register';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`);
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        const needsConfirmation = await signUp(email, password);
        if (needsConfirmation) {
          setConfirmationSentTo(email);
          return;
        }
      } else {
        await signIn(email, password);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSentTo) {
    return (
      <div className="mx-auto max-w-sm pt-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Bestätige deine E-Mail</h1>
        <p className="mt-2 text-muted">
          Wir haben einen Link an <span className="font-medium text-fg">{confirmationSentTo}</span>{' '}
          geschickt. Öffne ihn, um dein Konto zu aktivieren.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm pt-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        {isRegister ? 'Konto erstellen' : 'Willkommen zurück'}
      </h1>
      <p className="mt-2 text-muted">
        {isRegister
          ? 'Speichere deine Lieblingsmodelle und behalte ihre Preise im Blick.'
          : 'Melde dich an, um deine Favoriten zu sehen.'}
      </p>

      {!isAuthAvailable && (
        <p className="mt-6 rounded-2xl bg-surface p-4 text-sm text-muted">
          Im Demo-Modus gibt es keine Konten. Verbinde Supabase (siehe README), um Anmeldung und
          Registrierung zu aktivieren.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">E-Mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isAuthAvailable}
            className="mt-1.5 h-12 w-full rounded-xl bg-surface px-4 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-fg/30 disabled:opacity-50"
            placeholder="name@beispiel.de"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Passwort</span>
          <div className="relative mt-1.5">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={isRegister ? MIN_PASSWORD_LENGTH : undefined}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!isAuthAvailable}
              className="h-12 w-full rounded-xl bg-surface pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-fg/30 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {isRegister && (
            <span className="mt-1.5 block text-xs text-muted">Mindestens {MIN_PASSWORD_LENGTH} Zeichen</span>
          )}
        </label>

        {error && (
          <p role="alert" className="text-sm text-down">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!isAuthAvailable || submitting}
          className="h-12 w-full rounded-full bg-fg font-semibold text-bg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-40"
        >
          {submitting ? 'Bitte warten …' : isRegister ? 'Registrieren' : 'Anmelden'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isRegister ? 'Schon ein Konto?' : 'Noch kein Konto?'}{' '}
        <button type="button" onClick={onSwitchMode} className="font-semibold text-fg hover:underline">
          {isRegister ? 'Anmelden' : 'Registrieren'}
        </button>
      </p>
    </div>
  );
}
