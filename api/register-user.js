import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

const TMP_FILE = '/tmp/supermacho_users_v3.json';

const DEFAULT_SEED_USERS = [
  { id: 'u_100', user: 'zivo13@yahoo.com', plan: 'Free Rookie ($0/mo)', date: '2026-08-23', status: 'Active Subscriber' },
  { id: 'u_101', user: 'testuser@supermacho.app', plan: 'Free Rookie ($0/mo)', date: '2026-08-20', status: 'Active Subscriber' },
  { id: 'u_102', user: 'league_champ@gmail.com', plan: 'Pro Champion ($4.99/mo)', date: '2026-08-21', status: 'Active Subscriber' },
  { id: 'u_103', user: 'dynasty_boss@yahoo.com', plan: 'SuperMacho Commissioner ($9.99/mo)', date: '2026-08-22', status: 'Active Subscriber' }
];

// Helper to read persistent disk state across lambda invocations
function readState() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      const deletedMap = parsed.deleted || {};
      
      let userList = parsed.users;
      if (!userList || userList.length === 0) {
        userList = DEFAULT_SEED_USERS.filter(u => !deletedMap[u.user.toLowerCase()]);
      } else {
        userList = userList.filter(u => !deletedMap[u.user.toLowerCase()]);
      }

      return {
        users: userList,
        suspended: parsed.suspended || {},
        profiles: parsed.profiles || {},
        deleted: deletedMap
      };
    }
  } catch (e) {}

  return { users: DEFAULT_SEED_USERS, suspended: {}, profiles: {}, deleted: {} };
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
      const { email } = req.body || {};
      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        currentState.deleted[cleanEmail] = true;
        currentState.users = currentState.users.filter(u => u.user.toLowerCase() !== cleanEmail);
        delete currentState.suspended[cleanEmail];
        delete currentState.profiles[cleanEmail];
        saveState(currentState);
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

    return res.status(200).json({ 
      users: currentState.users, 
      suspended: currentState.suspended,
      profiles: currentState.profiles
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
