import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const LOCAL_DB_FILE = path.join(process.cwd(), 'api', 'users_db.json');
const TMP_FILE = '/tmp/supermacho_users_v3.json';

const PASSWORDS = {
  'zivo13@yahoo.com': '123456',
  'zivo13@hotmail.com': '123456',
  'doctorluismoralesae@gmail.com': '123456'
};

const DEFAULT_USERS = [
  { 
    id: 'u_100', 
    user: 'zivo13@yahoo.com', 
    plan: '300 Credits Commissioner ($24.99 USD)', 
    date: '2026-08-23', 
    status: 'Active Subscriber',
    leagues: [
      {
        id: 'l_zivo13_main',
        name: 'ESPN League #8492019',
        platform: 'ESPN',
        leagueId: '8492019',
        teamId: '3',
        scoring: 'PPR',
        espnS2: 'AE_CONFIGURED_PRO_S2',
        swid: '{SWID_CONFIGURED_PRO}',
        status: 'Connected & Synced'
      }
    ]
  },
  { 
    id: 'u_102', 
    user: 'doctorluismoralesae@gmail.com', 
    plan: '20 Free Credits Rookie ($0.00 USD)', 
    date: '2026-08-23', 
    status: 'Active Subscriber',
    leagues: [
      {
        id: 'l_doc_main',
        name: 'ESPN League #8492019',
        platform: 'ESPN',
        leagueId: '8492019',
        teamId: '1',
        scoring: 'PPR',
        espnS2: 'AE_CONFIGURED_ROOKIE_S2',
        swid: '{SWID_CONFIGURED_ROOKIE}',
        status: 'Connected & Synced'
      }
    ]
  }
];

function readState() {
  let userList = [];
  let deletedMap = {};
  let suspendedMap = {};
  let profilesMap = {};

  // 1. Try reading /tmp file first
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
        userList = parsed.users;
        deletedMap = parsed.deleted || {};
        suspendedMap = parsed.suspended || {};
        profilesMap = parsed.profiles || {};
      }
    }
  } catch (e) {}

  // 2. Fallback to local DB JSON file
  if (!userList || userList.length === 0) {
    try {
      if (fs.existsSync(LOCAL_DB_FILE)) {
        const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          userList = parsed;
        } else if (parsed && Array.isArray(parsed.users)) {
          userList = parsed.users;
          deletedMap = parsed.deleted || {};
          suspendedMap = parsed.suspended || {};
          profilesMap = parsed.profiles || {};
        }
      }
    } catch (e) {}
  }

  // 3. Fallback to DEFAULT_USERS if still empty
  if (!userList || userList.length === 0) {
    userList = [...DEFAULT_USERS];
  }

  // Filter out any explicitly deleted users
  userList = userList.filter(u => u && u.user && !deletedMap[u.user.toLowerCase()]);

  return {
    users: userList,
    deleted: deletedMap,
    suspended: suspendedMap,
    profiles: profilesMap
  };
}

function saveState(state) {
  const payload = {
    users: state.users || [],
    deleted: state.deleted || {},
    suspended: state.suspended || {},
    profiles: state.profiles || {}
  };

  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(payload, null, 2));
  } catch (e) {}

  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(state.users || [], null, 2));
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const currentState = readState();

  if (req.method === 'POST') {
    try {
      const { email, password, action, role, plan, status, profile, credits, leagues } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email required' });

      const cleanEmail = email.trim().toLowerCase();
      if (password) PASSWORDS[cleanEmail] = password;

      if (currentState.deleted[cleanEmail]) {
        if (action === 'login') {
          return res.status(404).json({ error: 'ACCOUNT_NOT_FOUND', message: 'No account found with this email address.' });
        }
      }

      if (currentState.suspended[cleanEmail] && action === 'login') {
        return res.status(403).json({ error: 'ACCOUNT_SUSPENDED', message: 'ACCOUNT SUSPENDED: Your account has been suspended by the League Commissioner.' });
      }

      const existingIndex = currentState.users.findIndex(u => u && u.user && u.user.toLowerCase() === cleanEmail);
      const userExists = existingIndex !== -1;

      if (action === 'login') {
        const isAdmin = cleanEmail.includes('admin') || cleanEmail.includes('zivo13');
        if (!userExists && !isAdmin) {
          return res.status(404).json({ error: 'ACCOUNT_NOT_FOUND', message: 'No account found with this email address. Please click Join to register an account first!' });
        }
        if (PASSWORDS[cleanEmail] && password && PASSWORDS[cleanEmail] !== password) {
          return res.status(401).json({ error: 'INVALID_PASSWORD', message: 'Incorrect password. Please enter the correct password.' });
        }

        const matchedUser = userExists ? currentState.users[existingIndex] : {
          user: cleanEmail,
          plan: isAdmin ? '300 Credits Commissioner ($24.99 USD)' : '20 Free Credits Rookie ($0.00 USD)',
          role: isAdmin ? 'admin' : 'client',
          status: 'Active Subscriber',
          leagues: currentState.profiles[cleanEmail]?.leagues || []
        };

        return res.status(200).json({
          success: true,
          user: matchedUser,
          profile: currentState.profiles[cleanEmail] || null,
          leagues: matchedUser.leagues || currentState.profiles[cleanEmail]?.leagues || []
        });
      }

      if (action === 'signup') {
        if (userExists && !currentState.deleted[cleanEmail]) {
          return res.status(400).json({ error: 'ACCOUNT_EXISTS', message: 'An account already exists with this email address. Please click Sign In to log in!' });
        }
      }

      const currentLeagues = leagues || (userExists ? currentState.users[existingIndex].leagues : (currentState.profiles[cleanEmail]?.leagues || []));

      // Update / Upsert user profile
      const updatedUser = {
        id: userExists ? currentState.users[existingIndex].id : ('u_' + Date.now()),
        user: cleanEmail,
        plan: plan || (userExists ? currentState.users[existingIndex].plan : (role === 'admin' ? '300 Credits Commissioner ($24.99 USD)' : '20 Free Credits Rookie ($0.00 USD)')),
        date: userExists ? currentState.users[existingIndex].date : 'Registered',
        status: status || (userExists ? currentState.users[existingIndex].status : 'Active Subscriber'),
        leagues: currentLeagues
      };

      if (existingIndex !== -1) {
        currentState.users[existingIndex] = updatedUser;
      } else {
        currentState.users.push(updatedUser);
      }

      currentState.profiles[cleanEmail] = {
        ...(currentState.profiles[cleanEmail] || {}),
        ...(profile || {}),
        leagues: currentLeagues
      };

      saveState(currentState);

      // Best-effort Supabase sync
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from('profiles').upsert({
          email: cleanEmail,
          role: role || (cleanEmail.includes('admin') ? 'admin' : 'client'),
          plan_id: plan?.toLowerCase().includes('pro') ? 'pro' : (plan?.toLowerCase().includes('commissioner') ? 'commissioner' : 'free')
        }, { onConflict: 'email' });
      } catch (e) {}

      return res.status(200).json({
        success: true,
        users: currentState.users,
        user: updatedUser,
        leagues: currentLeagues
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { email, clearAllTestUsers } = req.body || {};

      if (clearAllTestUsers) {
        currentState.users = DEFAULT_USERS.filter(u => u.user !== 'zivo13@hotmail.com');
        currentState.deleted = { 'zivo13@hotmail.com': true };
        saveState(currentState);
        return res.status(200).json({ success: true, users: currentState.users });
      }

      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        currentState.deleted[cleanEmail] = true;
        currentState.users = currentState.users.filter(u => u && u.user && u.user.toLowerCase() !== cleanEmail);
        delete currentState.suspended[cleanEmail];
        delete currentState.profiles[cleanEmail];
        saveState(currentState);

        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          await supabase.from('profiles').delete().eq('email', cleanEmail);
        } catch (e) {}
      }

      return res.status(200).json({ success: true, users: currentState.users });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      users: currentState.users
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
