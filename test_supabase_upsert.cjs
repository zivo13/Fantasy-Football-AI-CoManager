process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== TESTING SUPABASE UPSERT & RETRIEVE ===");
  
  const testLeagues = [
    {
      id: 'l_real_123',
      name: 'ESPN League #8492019',
      platform: 'ESPN',
      leagueId: '8492019',
      teamId: '3',
      scoring: 'PPR',
      espnS2: 'AE_REAL_S2_COOKIE',
      swid: '{SWID_REAL_123}',
      status: 'Connected & Synced'
    }
  ];

  // 1. Try upserting to profiles table
  const { data: upsertData, error: upsertErr } = await supabase.from('profiles').upsert({
    email: 'zivo13@yahoo.com',
    role: 'admin',
    plan_id: 'commissioner',
    leagues: testLeagues
  }, { onConflict: 'email' });

  console.log("UPSERT ERROR:", upsertErr);
  console.log("UPSERT DATA:", upsertData);

  // 2. Query profiles table for zivo13@yahoo.com
  const { data: selData, error: selErr } = await supabase.from('profiles').select('*').eq('email', 'zivo13@yahoo.com');
  console.log("SELECT ERROR:", selErr);
  console.log("SELECT DATA:", JSON.stringify(selData, null, 2));
}

run().catch(console.error);
