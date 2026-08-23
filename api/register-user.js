import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

const TMP_FILE = '/tmp/supermacho_users_v2.json';

// Helper to read persistent disk state across lambda invocations
function readState() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {}
  return { users: [], suspended: {} };
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
      const { email, role, plan, status } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email required' });

      const cleanEmail = email.trim().toLowerCase();

      if (status) {
        if (status.includes('Suspended') || status.includes('Inactive')) {
          currentState.suspended[cleanEmail] = true;
        } else {
          currentState.suspended[cleanEmail] = false;
        }
      }
      
      const existingIndex = currentState.users.findIndex(u => u.user.toLowerCase() === cleanEmail);

      if (existingIndex !== -1) {
        if (plan) currentState.users[existingIndex].plan = plan;
        if (status) currentState.users[existingIndex].status = status;
      } else {
        const newUser = {
          id: 'u_' + Date.now(),
          user: cleanEmail,
          plan: plan || (role === 'admin' ? 'SuperMacho Commissioner' : 'Free Rookie ($0/mo)'),
          date: 'Just now',
          status: status || 'Active Subscriber'
        };
        currentState.users.unshift(newUser);
      }
      
      saveState(currentState);

      // If Supabase is configured, save to Supabase profiles
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from('profiles').upsert({
          email: cleanEmail,
          role: role || 'client',
          plan_id: plan ? plan.split(' ')[0].toLowerCase() : 'free',
          status: status || 'active'
        }, { onConflict: 'email' });
      }

      return res.status(200).json({ 
        success: true, 
        users: currentState.users, 
        suspended: currentState.suspended 
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
        currentState.users = currentState.users.filter(u => u.user.toLowerCase() !== cleanEmail);
        delete currentState.suspended[cleanEmail];
        saveState(currentState);
      }
      return res.status(200).json({ success: true, users: currentState.users });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'GET') {
    // Parse query params properly using URL object
    let checkEmail = null;
    try {
      const reqUrl = req.url || '';
      if (reqUrl.includes('check_suspended=')) {
        const paramStr = reqUrl.split('check_suspended=')[1];
        if (paramStr) {
          checkEmail = decodeURIComponent(paramStr.split('&')[0]).trim().toLowerCase();
        }
      }
    } catch (e) {}

    if (checkEmail) {
      const isSuspended = !!currentState.suspended[checkEmail];
      return res.status(200).json({ email: checkEmail, isSuspended });
    }

    return res.status(200).json({ 
      users: currentState.users, 
      suspended: currentState.suspended 
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
