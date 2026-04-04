import { isSupabaseConfigured, supabase } from './client';

export type UserProfile = {
  id: string;
  username: string;
  created_at: string;
  total_words: number;
  total_buildings: number;
  best_streak: number;
};

function guestUsernameFromUserId(userId: string): string {
  const hex = userId.replace(/-/g, '');
  return `Player_${hex.slice(0, 6)}`;
}

/** Nach anonymem (oder OAuth-) Login: Profilzeile anlegen, falls noch nicht vorhanden. */
export async function ensureProfileForUser(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const existing = await getProfile(userId);
  if (existing) return;
  await createProfile(userId, guestUsernameFromUserId(userId));
}

export async function createProfile(userId: string, username: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('user_profiles').insert({
    id: userId,
    username,
    total_words: 0,
    total_buildings: 0,
    best_streak: 0,
  });
  if (error && error.code !== '23505') {
    console.error('createProfile', error);
  }
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as UserProfile;
}

export async function updateProfile(
  userId: string,
  data: Partial<Pick<UserProfile, 'username' | 'total_words' | 'total_buildings' | 'best_streak'>>,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('user_profiles').update(data).eq('id', userId);
  if (error) console.error('updateProfile', error);
}
