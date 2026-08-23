import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

// Global In-Memory Fallback for cross-device registrations
let globalUserStore = global._supermacho_global_users || [
  { id: 'u_1', user: 'chad.gridiron@gmail.com', plan: 'Pro Champion ($4.99)', date: '5 mins ago', status: 'Active (Mobile)' },
  { id: 'u_2', user: 'marcus.vance@yahoo.com', plan: 'SuperMacho Commissioner ($9.99)', date: '12 mins ago', status: 'Active (Web)' }
];
global._supermacho_global_users = globalUserStore;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { email, role, plan } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email required' });

      const cleanEmail = email.trim().toLowerCase();
      
      const newUser = {
        id: 'u_' + Date.now(),
        user: cleanEmail,
        plan: plan || (role === 'admin' ? 'SuperMacho Commissioner' : 'Pro Champion ($4.99/mo)'),
        date: 'Just now',
        status: 'Active (Global Mobile)'
      };

      // Check duplicate
      const exists = globalUserStore.some(u => u.user.toLowerCase() === cleanEmail);
      if (!exists) {
        globalUserStore.unshift(newUser);
        global._supermacho_global_users = globalUserStore;
      }

      // If Supabase is configured, save to Supabase profiles
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from('profiles').upsert({
          email: cleanEmail,
          role: role || 'client',
          plan_id: 'pro'
        }, { onConflict: 'email' });
      }

      return res.status(200).json({ success: true, user: newUser, users: globalUserStore });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json({ users: globalUserStore });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
