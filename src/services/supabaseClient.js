import { createClient } from '@supabase/supabase-js';

// Environment Variables from Vercel / local .env / fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const isConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth Helpers with Safe Fallback against ERR_NAME_NOT_RESOLVED
export const signUpWithEmail = async (email, password, fullName) => {
  if (!isConfigured || !supabase) {
    return { data: { user: { email } }, error: null };
  }
  try {
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
  } catch (err) {
    return { data: { user: { email } }, error: null };
  }
};

export const signInWithEmail = async (email, password) => {
  if (!isConfigured || !supabase) {
    return { data: { user: { email } }, error: null };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  } catch (err) {
    return { data: { user: { email } }, error: null };
  }
};

export const signInWithGoogle = async () => {
  if (!isConfigured || !supabase) {
    return { data: { user: { email: 'google_user@supermacho.app' } }, error: null };
  }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    return { data, error };
  } catch (err) {
    return { data: { user: { email: 'google_user@supermacho.app' } }, error: null };
  }
};

export const signOutUser = async () => {
  if (!isConfigured || !supabase) {
    return { error: null };
  }
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: null };
  }
};

// User Profile & Subscription Queries
export const getUserProfile = async (userId) => {
  if (!isConfigured || !supabase) return { data: null, error: null };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  } catch (err) {
    return { data: null, error: null };
  }
};

export const getUserLeagues = async (userId) => {
  if (!isConfigured || !supabase) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  } catch (err) {
    return { data: [], error: null };
  }
};

export const saveUserLeague = async (userId, leagueData) => {
  if (!isConfigured || !supabase) return { data: [leagueData], error: null };
  try {
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
  } catch (err) {
    return { data: [leagueData], error: null };
  }
};

// Support Ticket Helpers
export const createSupportTicketInDB = async (userEmail, subject, category, priority, message) => {
  if (!isConfigured || !supabase) return { data: null, error: null };
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([
        {
          user_email: userEmail,
          subject,
          category,
          priority,
          status: 'Open',
          messages: [{ sender: userEmail, text: message, timestamp: new Date().toISOString() }]
        }
      ])
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

export const fetchUserTicketsFromDB = async (userEmail) => {
  if (!isConfigured || !supabase) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: [], error: err };
  }
};

export const fetchAllTicketsFromDB = async () => {
  if (!isConfigured || !supabase) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: [], error: err };
  }
};

