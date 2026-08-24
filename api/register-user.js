import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

const TMP_FILE = '/tmp/supermacho_users_v3.json';

import path from 'path';

const BASE_USERS = [
  { id: 'u_100', user: 'zivo13@yahoo.com', plan: 'SuperMacho Commissioner ($9.99/mo)', date: '2026-08-23', status: 'Active Subscriber' },
  { id: 'u_101', user: 'zivo13@hotmail.com', plan: 'Free Rookie ($0/mo)', date: '2026-08-23', status: 'Active Subscriber' },
  { id: 'u_102', user: 'doctorluismoralesae@gmail.com', plan: 'Free Rookie ($0/mo)', date: '2026-08-23', status: 'Active Subscriber' }
];

// Helper to read persistent disk state across lambda invocations
function readState() {
  let deletedMap = {};
  let suspendedMap = {};
  let profilesMap = {};
  let userList = [];

  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      deletedMap = parsed.deleted || {};
      suspendedMap = parsed.suspended || {};
      profilesMap = parsed.profiles || {};
      userList = parsed.users || [];
    }
  } catch (e) {}

  if (!userList || userList.length === 0) {
    userList = [...BASE_USERS];
  } else {
    // Ensure base users are present if not explicitly deleted
    BASE_USERS.forEach(b => {
      if (!userList.some(u => u && u.user && u.user.toLowerCase() === b.user.toLowerCase())) {
        userList.push(b);
      }
    });
  }

  // Filter out any explicitly deleted users
  userList = userList.filter(u => u && u.user && !deletedMap[u.user.toLowerCase()]);

  return {
    users: userList,
    suspended: suspendedMap,
    profiles: profilesMap,
    deleted: deletedMap
  };
}

// Helper to write persistent disk state
function saveState(state) {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(state));
  } catch (e) {}
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const currentState = readState();

  if (req.method === 'POST') {
    try {
      const { email, role, plan, status, profile } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email required' });

      const cleanEmail = email.trim().toLowerCase();

      // Remove from deleted list if re-registering
      delete currentState.deleted[cleanEmail];

      if (status) {
        if (status.includes('Suspended') || status.includes('Inactive')) {
          currentState.suspended[cleanEmail] = true;
        } else {
          currentState.suspended[cleanEmail] = false;
        }
      }

      if (profile) {
        currentState.profiles[cleanEmail] = {
          ...currentState.profiles[cleanEmail],
          ...profile
        };
      }
      
      const existingIndex = currentState.users.findIndex(u => u.user.toLowerCase() === cleanEmail);

      if (existingIndex !== -1) {
        if (plan) currentState.users[existingIndex].plan = plan;
        if (status) currentState.users[existingIndex].status = status;
        if (profile) currentState.users[existingIndex].profile = currentState.profiles[cleanEmail];
      } else {
        const newUser = {
          id: 'u_' + Date.now(),
          user: cleanEmail,
          plan: plan || (role === 'admin' ? 'SuperMacho Commissioner' : 'Free Rookie ($0/mo)'),
          date: 'Just now',
          status: status || 'Active Subscriber',
          profile: currentState.profiles[cleanEmail] || null
        };
        currentState.users.unshift(newUser);
      }
      
      saveState(currentState);

      // Save to Supabase profile if configured
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from('profiles').upsert({
          email: cleanEmail,
          role: role || 'client',
          plan_id: plan ? plan.split(' ')[0].toLowerCase() : 'free',
          status: status || 'active',
          birthday: profile?.birthday || null,
          favorite_number: profile?.favoriteNumber || null,
          favorite_team: profile?.favoriteTeam || null,
          preferred_language: profile?.prefLang || 'en'
        }, { onConflict: 'email' });
      }

      return res.status(200).json({ 
        success: true, 
        users: currentState.users, 
        suspended: currentState.suspended,
        profile: currentState.profiles[cleanEmail] || null
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { email, clearAllTestUsers } = req.body || {};

      if (clearAllTestUsers) {
        // Clear all users except primary admin
        currentState.users = currentState.users.filter(u => u.user && u.user.toLowerCase().includes('admin'));
        currentState.profiles = {};
        currentState.suspended = {};
        currentState.deleted = {};
        saveState(currentState);

        if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
          try {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            await supabase.from('profiles').delete().neq('role', 'admin');
          } catch (e) {}
        }

        return res.status(200).json({ success: true, users: currentState.users });
      }

      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        currentState.deleted[cleanEmail] = true;
        currentState.users = currentState.users.filter(u => u.user.toLowerCase() !== cleanEmail);
        delete currentState.suspended[cleanEmail];
        delete currentState.profiles[cleanEmail];
        saveState(currentState);

        // Delete from Supabase profiles table if configured
        if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
          try {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            await supabase.from('profiles').delete().eq('email', cleanEmail);
          } catch (e) {}
        }
      }
      return res.status(200).json({ success: true, users: currentState.users });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'GET') {
    let checkEmail = null;
    let getProfileEmail = null;

    try {
      const reqUrl = req.url || '';
      if (reqUrl.includes('check_suspended=')) {
        const paramStr = reqUrl.split('check_suspended=')[1];
        if (paramStr) {
          checkEmail = decodeURIComponent(paramStr.split('&')[0]).trim().toLowerCase();
        }
      }
      if (reqUrl.includes('get_profile=')) {
        const paramStr = reqUrl.split('get_profile=')[1];
        if (paramStr) {
          getProfileEmail = decodeURIComponent(paramStr.split('&')[0]).trim().toLowerCase();
        }
      }
    } catch (e) {}

    if (checkEmail) {
      const isSuspended = !!currentState.suspended[checkEmail];
      return res.status(200).json({ email: checkEmail, isSuspended });
    }

    if (getProfileEmail) {
      const profile = currentState.profiles[getProfileEmail] || null;
      return res.status(200).json({ email: getProfileEmail, profile });
    }

    // Merge Supabase database profiles into users list if configured
    let allUsers = [...currentState.users];

    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: dbProfiles } = await supabase.from('profiles').select('*');
        if (dbProfiles && Array.isArray(dbProfiles) && dbProfiles.length > 0) {
          const userMap = new Map();
          
          // Seed currentState users first
          allUsers.forEach(u => {
            if (u && u.user) userMap.set(u.user.toLowerCase(), u);
          });

          // Override / hydrate with Supabase DB profiles
          dbProfiles.forEach(p => {
            if (p && p.email) {
              const cleanE = p.email.toLowerCase();
              const planName = p.plan_id === 'pro' ? 'Pro Champion ($4.99/mo)' : p.plan_id === 'commissioner' ? 'SuperMacho Commissioner ($9.99/mo)' : 'Free Rookie ($0/mo)';
              userMap.set(cleanE, {
                id: p.id || 'u_' + cleanE,
                user: cleanE,
                plan: planName,
                date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Registered',
                status: p.status || 'Active Subscriber',
                profile: {
                  email: cleanE,
                  birthday: p.birthday,
                  favoriteTeam: p.favorite_team,
                  favoriteNumber: p.favorite_number,
                  prefLang: p.preferred_language,
                  profileCompleted: p.profile_completed
                }
              });
            }
          });

          allUsers = Array.from(userMap.values());
        }
      } catch (e) {}
    }

    return res.status(200).json({ 
      users: allUsers, 
      suspended: currentState.suspended,
      profiles: currentState.profiles
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
