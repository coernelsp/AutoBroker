import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Without credentials the app runs on generated demo data and without accounts.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        // PKCE returns email-confirmation links as `?code=` instead of a URL hash,
        // which would collide with the app's hash routing.
        auth: { flowType: 'pkce' },
      })
    : null;
