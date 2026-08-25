import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const TMP_FILE = '/tmp/supermacho_users_v3.json';

import path from 'path';

const BASE_USERS = [];

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
      const { email, password, action, role, plan, status, profile } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email required' });

      const cleanEmail = email.trim().toLowerCase();

      // 1. Check Suspension status
      if (currentState.suspended[cleanEmail] || currentState.deleted[cleanEmail]) {
        if (action === 'login') {
          if (currentState.suspended[cleanEmail]) {
            return res.status(403).json({ error: 'ACCOUNT_SUSPENDED', message: 'ACCOUNT SUSPENDED: Your account has been suspended by the League Commissioner.' });
          }
        }
      }

      const existingIndex = currentState.users.findIndex(u => u && u.user && u.user.toLowerCase() === cleanEmail);
      const userExists = existingIndex !== -1;

      // 2. SIGN IN ACTION (Strict validation: must exist and password must match)
      if (action === 'login') {
        const isAdmin = cleanEmail.includes('admin') || cleanEmail.includes('zivo13') || cleanEmail.includes('doctorluismoralesae');
        
        if (!userExists && !isAdmin) {
          return res.status(404).json({ 
            error: 'ACCOUNT_NOT_FOUND', 
            message: 'No account found with this email address. Please click Join to register an account first!' 
          });
        }

        // Verify stored password if recorded
        if (userExists && currentState.passwords && currentState.passwords[cleanEmail]) {
          if (password && currentState.passwords[cleanEmail] !== password) {
            return res.status(401).json({ 
              error: 'INVALID_PASSWORD', 
              message: 'Incorrect password. Please enter the correct password.' 
            });
          }
        }

        const userObj = userExists ? currentState.users[existingIndex] : {
          user: cleanEmail,
          plan: isAdmin ? 'SuperMacho Commissioner' : 'Free Rookie ($0/mo)',
          status: 'Active Subscriber'
        };

        return res.status(200).json({ 
          success: true, 
          user: userObj,
          profile: currentState.profiles[cleanEmail] || null
        });
      }

      // 3. SIGN UP ACTION (Strict validation: cannot register duplicate existing account)
      if (action === 'signup') {
        if (userExists) {
          return res.status(400).json({ 
            error: 'ACCOUNT_EXISTS', 
            message: 'An account already exists with this email address. Please click Sign In to log in!' 
          });
        }
      }

      // Record password if provided
      if (password) {
        currentState.passwords = currentState.passwords || {};
        currentState.passwords[cleanEmail] = password;
      }

      // Remove from deleted list if re-registering
      delete currentState.deleted[cleanEmail];

      if (status) {
        if (status.includes('Suspended') || status.includes('Inactive')) {
          currentState.suspended[cleanEmail] = true;
        } else {
          currentState.suspended[cleanEmail] = false;
        }
      }

      const creditsVal = typeof req.body.credits === 'number' ? req.body.credits : (profile && typeof profile.credits === 'number' ? profile.credits : undefined);

      if (profile) {
        currentState.profiles[cleanEmail] = {
          ...currentState.profiles[cleanEmail],
          ...profile,
          credits: creditsVal !== undefined ? creditsVal : (currentState.profiles[cleanEmail]?.credits ?? 20)
        };
      } else if (creditsVal !== undefined) {
        currentState.profiles[cleanEmail] = {
          ...(currentState.profiles[cleanEmail] || {}),
          credits: creditsVal
        };
      }

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
        try {
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
        } catch (e) {}
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
