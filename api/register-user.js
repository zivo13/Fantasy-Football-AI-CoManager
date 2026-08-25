import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// In-memory passwords fallback for non-Supabase auth
const PASSWORDS = {
  'zivo13@yahoo.com': '123456',
  'zivo13@hotmail.com': '123456',
  'doctorluismoralesae@gmail.com': '123456'
};

// Initial DB seed data if Supabase profiles table is completely empty
const SEED_PROFILES = [
  { email: 'zivo13@yahoo.com', role: 'admin', plan_id: 'commissioner', credits: 300, status: 'Active Subscriber' },
  { email: 'zivo13@hotmail.com', role: 'client', plan_id: 'free', credits: 20, status: 'Active Subscriber' },
  { email: 'doctorluismoralesae@gmail.com', role: 'client', plan_id: 'free', credits: 20, status: 'Active Subscriber' }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabase();

  // Helper to map DB plan_id to human readable title
  const getPlanTitle = (planId) => {
    if (planId === 'commissioner') return '300 Credits Commissioner ($24.99 USD)';
    if (planId === 'pro') return '100 Credits Pro Champion ($9.99 USD)';
    if (planId === 'booster') return '50 Credits Quick Booster ($5.99 USD)';
    return '20 Free Credits Rookie ($0.00 USD)';
  };

  // Helper to map input plan string to canonical DB plan_id
  const parsePlanId = (planStr) => {
    if (!planStr) return 'free';
    const lower = planStr.toLowerCase();
    if (lower.includes('300') || lower.includes('commissioner')) return 'commissioner';
    if (lower.includes('100') || lower.includes('pro')) return 'pro';
    if (lower.includes('50') || lower.includes('booster')) return 'booster';
    return 'free';
  };

  // Ensure DB has initial seed profiles if database table is completely empty
  const ensureDbSeeded = async () => {
    try {
      const { data } = await supabase.from('profiles').select('email');
      if (!data || data.length === 0) {
        for (const seed of SEED_PROFILES) {
          await supabase.from('profiles').upsert(seed, { onConflict: 'email' });
        }
      }
    } catch (e) {}
  };

  if (req.method === 'POST') {
    try {
      const { email, password, action, role, plan, status, profile, credits } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email required' });

      const cleanEmail = email.trim().toLowerCase();
      await ensureDbSeeded();

      // Record password in memory
      if (password) {
        PASSWORDS[cleanEmail] = password;
      }

      // 1. Fetch current profile from Supabase Postgres DB
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      const userExists = !!dbProfile;

      // 2. LOGIN ACTION
      if (action === 'login') {
        const isAdmin = cleanEmail.includes('admin') || cleanEmail.includes('zivo13');

        if (dbProfile && (dbProfile.status === 'Deleted' || dbProfile.status === 'Suspended')) {
          if (dbProfile.status === 'Suspended') {
            return res.status(403).json({ error: 'ACCOUNT_SUSPENDED', message: 'ACCOUNT SUSPENDED: Your account has been suspended by the League Commissioner.' });
          }
        }

        if (!userExists && !isAdmin) {
          return res.status(404).json({ 
            error: 'ACCOUNT_NOT_FOUND', 
            message: 'No account found with this email address. Please click Join to register an account first!' 
          });
        }

        if (PASSWORDS[cleanEmail] && password && PASSWORDS[cleanEmail] !== password) {
          return res.status(401).json({ 
            error: 'INVALID_PASSWORD', 
            message: 'Incorrect password. Please enter the correct password.' 
          });
        }

        const planTitle = getPlanTitle(dbProfile?.plan_id || 'free');

        return res.status(200).json({ 
          success: true, 
          user: {
            user: cleanEmail,
            plan: planTitle,
            role: dbProfile?.role || (isAdmin ? 'admin' : 'client'),
            status: dbProfile?.status || 'Active Subscriber'
          },
          profile: dbProfile || null
        });
      }

      // 3. SIGNUP ACTION
      if (action === 'signup') {
        if (userExists && dbProfile.status !== 'Deleted') {
          return res.status(400).json({ 
            error: 'ACCOUNT_EXISTS', 
            message: 'An account already exists with this email address. Please click Sign In to log in!' 
          });
        }
      }

      // 4. UPSERT PROFILE DIRECTLY TO SUPABASE POSTGRES DB
      const mappedPlanId = plan ? parsePlanId(plan) : (dbProfile?.plan_id || 'free');
      const assignedRole = role || dbProfile?.role || (cleanEmail.includes('admin') || cleanEmail.includes('zivo13') ? 'admin' : 'client');
      const creditsVal = typeof credits === 'number' ? credits : (typeof profile?.credits === 'number' ? profile.credits : (dbProfile?.credits ?? 20));
      const statusVal = status || (dbProfile?.status && dbProfile.status !== 'Deleted' ? dbProfile.status : 'Active Subscriber');

      const upsertData = {
        email: cleanEmail,
        role: assignedRole,
        plan_id: mappedPlanId,
        credits: creditsVal,
        status: statusVal,
        updated_at: new Date().toISOString()
      };

      if (profile?.birthday) upsertData.birthday = profile.birthday;
      if (profile?.favoriteNumber) upsertData.favorite_number = profile.favoriteNumber;
      if (profile?.favoriteTeam) upsertData.favorite_team = profile.favoriteTeam;
      if (profile?.prefLang) upsertData.preferred_language = profile.prefLang;

      await supabase.from('profiles').upsert(upsertData, { onConflict: 'email' });

      // Return updated users list from Supabase Postgres DB
      const { data: updatedProfiles } = await supabase.from('profiles').select('*');
      const allUsers = (updatedProfiles || [])
        .filter(p => p && p.email && p.status !== 'Deleted')
        .map(p => ({
          id: p.id || 'u_' + p.email,
          user: p.email,
          plan: getPlanTitle(p.plan_id),
          date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Registered',
          status: p.status || 'Active Subscriber',
          profile: p
        }));

      return res.status(200).json({ 
        success: true, 
        users: allUsers,
        profile: upsertData
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { email, clearAllTestUsers } = req.body || {};

      if (clearAllTestUsers) {
        await supabase.from('profiles').delete().neq('role', 'admin');
        const { data: remaining } = await supabase.from('profiles').select('*');
        const allUsers = (remaining || []).map(p => ({
          id: p.id || 'u_' + p.email,
          user: p.email,
          plan: getPlanTitle(p.plan_id),
          date: 'Registered',
          status: p.status || 'Active Subscriber'
        }));
        return res.status(200).json({ success: true, users: allUsers });
      }

      if (email) {
        const cleanEmail = email.trim().toLowerCase();

        // Hard delete from Supabase profiles table
        await supabase.from('profiles').delete().eq('email', cleanEmail);
        // Soft delete safety update
        await supabase.from('profiles').update({ status: 'Deleted' }).eq('email', cleanEmail);
      }

      // Fetch remaining users from Supabase Postgres DB
      const { data: remainingProfiles } = await supabase.from('profiles').select('*');
      const remainingUsers = (remainingProfiles || [])
        .filter(p => p && p.email && p.email.toLowerCase() !== email?.trim().toLowerCase() && p.status !== 'Deleted')
        .map(p => ({
          id: p.id || 'u_' + p.email,
          user: p.email,
          plan: getPlanTitle(p.plan_id),
          date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Registered',
          status: p.status || 'Active Subscriber',
          profile: p
        }));

      return res.status(200).json({ success: true, users: remainingUsers });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'GET') {
    await ensureDbSeeded();

    const { data: dbProfiles } = await supabase.from('profiles').select('*');

    const allUsers = (dbProfiles || [])
      .filter(p => p && p.email && p.status !== 'Deleted')
      .map(p => ({
        id: p.id || 'u_' + p.email,
        user: p.email,
        plan: getPlanTitle(p.plan_id),
        date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Registered',
        status: p.status || 'Active Subscriber',
        profile: p
      }));

    return res.status(200).json({ 
      users: allUsers
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
