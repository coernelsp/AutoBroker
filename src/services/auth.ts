import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const isAuthAvailable = supabase !== null;

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-Mail oder Passwort ist falsch.',
  email_not_confirmed: 'Bitte bestätige zuerst deine E-Mail-Adresse.',
  user_already_exists: 'Für diese E-Mail-Adresse gibt es bereits ein Konto.',
  email_exists: 'Für diese E-Mail-Adresse gibt es bereits ein Konto.',
  weak_password: 'Das Passwort ist zu schwach. Nutze mindestens 8 Zeichen.',
  over_email_send_rate_limit: 'Zu viele Versuche. Bitte warte einen Moment.',
  over_request_rate_limit: 'Zu viele Versuche. Bitte warte einen Moment.',
  validation_failed: 'Bitte prüfe deine Eingaben.',
};

function toFriendlyError(error: AuthError): Error {
  return new Error((error.code && ERROR_MESSAGES[error.code]) || error.message);
}

function requireClient() {
  if (!supabase) throw new Error('Anmeldung ist im Demo-Modus nicht verfügbar.');
  return supabase;
}

export async function signIn(email: string, password: string) {
  const { error } = await requireClient().auth.signInWithPassword({ email, password });
  if (error) throw toFriendlyError(error);
}

// Resolves to true when the user still has to confirm their email address.
export async function signUp(email: string, password: string): Promise<boolean> {
  const { data, error } = await requireClient().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw toFriendlyError(error);
  return data.session === null;
}

export async function signOut() {
  const { error } = await requireClient().auth.signOut();
  if (error) throw toFriendlyError(error);
}
