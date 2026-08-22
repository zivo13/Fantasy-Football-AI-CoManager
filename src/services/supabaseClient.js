import { createClient } from '@supabase/supabase-js';

// Environment Variables from Vercel / local .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth Helpers
export const signUpWithEmail = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
  return { data, error };
};

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  return { data, error };
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// User Profile & Subscription Queries
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const getUserLeagues = async (userId) => {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
};

export const saveUserLeague = async (userId, leagueData) => {
  const { data, error } = await supabase
    .from('leagues')
    .insert([
      {
        user_id: userId,
        name: leagueData.name,
        platform: leagueData.platform,
        league_id: leagueData.leagueId,
        team_id: leagueData.teamId,
        scoring: leagueData.scoring,
        espn_s2: leagueData.espnS2,
        swid: leagueData.swid
      }
    ])
    .select();
  return { data, error };
};
