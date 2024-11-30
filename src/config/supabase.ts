import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Provider = 'github' | 'google' | 'facebook' | 'twitter';

// Types pour les tables Supabase
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  provider?: Provider;
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

// Helper functions pour l'authentification sociale
export const signInWithSocial = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: provider === 'google' ? {
        access_type: 'offline',
        prompt: 'consent',
      } : undefined
    }
  });

  if (error) throw error;
  return data;
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
  return data;
};

export const handleAuthCallback = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) throw error;
  if (!session?.user) throw new Error('No user on the session');

  const { user } = session;
  const { user_metadata, app_metadata } = user;
  const provider = app_metadata.provider as Provider;

  // Construction du profil en fonction du provider
  const profile: Partial<Profile> = {
    id: user.id,
    email: user.email,
    updated_at: new Date().toISOString(),
    provider,
  };

  // Données spécifiques à Google
  if (provider === 'google') {
    profile.full_name = user_metadata.full_name || `${user_metadata.given_name} ${user_metadata.family_name}`.trim();
    profile.avatar_url = user_metadata.picture;
  }
  // Données spécifiques à GitHub
  else if (provider === 'github') {
    profile.full_name = user_metadata.full_name || user_metadata.preferred_username;
    profile.avatar_url = user_metadata.avatar_url;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .upsert(profile, { 
      onConflict: 'id',
      ignoreDuplicates: false 
    });

  if (updateError) throw updateError;

  return session;
};
