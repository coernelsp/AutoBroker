import { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';

export interface AuthContextValue {
  user: User | null;
  // True until the stored session has been restored.
  loading: boolean;
  // False in demo mode (no Supabase configured).
  available: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
