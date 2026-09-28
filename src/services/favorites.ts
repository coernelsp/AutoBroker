import { supabase } from '../lib/supabase';

// Signed-in users store favorites in Supabase (scoped by RLS). In demo mode,
// where accounts aren't available, they live in this browser's localStorage.

const LOCAL_KEY = 'autobroker-favorites';

function readLocal(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable (private mode): favorites last for this session only.
  }
}

export async function fetchFavoriteIds(): Promise<string[]> {
  if (!supabase) return readLocal();

  const { data, error } = await supabase
    .from('favorites')
    .select('car_model_id')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((row) => row.car_model_id as string);
}

export async function addFavorite(carModelId: string) {
  if (!supabase) return writeLocal([carModelId, ...readLocal().filter((id) => id !== carModelId)]);

  // user_id defaults to auth.uid(); 23505 = already a favorite (e.g. added in another tab).
  const { error } = await supabase.from('favorites').insert({ car_model_id: carModelId });
  if (error && error.code !== '23505') throw error;
}

export async function removeFavorite(carModelId: string) {
  if (!supabase) return writeLocal(readLocal().filter((id) => id !== carModelId));

  const { error } = await supabase.from('favorites').delete().eq('car_model_id', carModelId);
  if (error) throw error;
}
