import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

// Global server store initialized clean (empty)
let globalUserStore = global._supermacho_global_users || [];
global._supermacho_global_users = globalUserStore;

// Persistent suspended emails store across cold starts
let suspendedEmailsStore = global._supermacho_suspended_emails || {};
global._supermacho_suspended_emails = suspendedEmailsStore;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { email, role, plan, status } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email required' });

      const cleanEmail = email.trim().toLowerCase();

      if (status) {
        if (status.includes('Suspended') || status.includes('Inactive')) {
          suspendedEmailsStore[cleanEmail] = true;
        } else {
          suspendedEmailsStore[cleanEmail] = false;
        }
        global._supermacho_suspended_emails = suspendedEmailsStore;
      }
      
      const existingIndex = globalUserStore.findIndex(u => u.user.toLowerCase() === cleanEmail);

      if (existingIndex !== -1) {
        // Update existing user properties
        if (plan) globalUserStore[existingIndex].plan = plan;
        if (status) globalUserStore[existingIndex].status = status;
      } else {
        // Create new user with default Free Rookie tier
        const newUser = {
          id: 'u_' + Date.now(),
          user: cleanEmail,
          plan: plan || (role === 'admin' ? 'SuperMacho Commissioner' : 'Free Rookie ($0/mo)'),
          date: 'Just now',
          status: status || 'Active Subscriber'
        };
        globalUserStore.unshift(newUser);
      }
      
      global._supermacho_global_users = globalUserStore;

      // If Supabase is configured, save to Supabase profiles
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from('profiles').upsert({
          email: cleanEmail,
          role: role || 'client',
          plan_id: plan ? plan.split(' ')[0].toLowerCase() : 'free'
        }, { onConflict: 'email' });
      }

      return res.status(200).json({ 
        success: true, 
        users: globalUserStore, 
        suspended: suspendedEmailsStore 
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
        globalUserStore = globalUserStore.filter(u => u.user.toLowerCase() !== cleanEmail);
        global._supermacho_global_users = globalUserStore;
        delete suspendedEmailsStore[cleanEmail];
      }
      return res.status(200).json({ success: true, users: globalUserStore });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'GET') {
    const { check_suspended } = req.query || {};
    if (check_suspended) {
      const checkEmail = check_suspended.trim().toLowerCase();
      const isSuspended = !!suspendedEmailsStore[checkEmail];
      return res.status(200).json({ email: checkEmail, isSuspended });
    }

    return res.status(200).json({ 
      users: globalUserStore, 
      suspended: suspendedEmailsStore 
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
