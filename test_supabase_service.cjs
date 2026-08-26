process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdmryhxmfgedfdleytwn.supabase.co';

// Try standard keys
const keys = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
];

async function run() {
  console.log("=== TESTING SUPABASE WITH SERVICE ROLE ===");

  for (const key of keys) {
    if (!key) continue;
    const supabase = createClient(supabaseUrl, key);
    
    // Select from profiles
    const { data: pData, error: pErr } = await supabase.from('profiles').select('*');
    console.log("PROFILES WITH KEY:", pErr ? pErr.message : `SUCCESS (${pData.length} rows)`);

    // Select from leagues
    const { data: lData, error: lErr } = await supabase.from('leagues').select('*');
    console.log("LEAGUES WITH KEY:", lErr ? lErr.message : `SUCCESS (${lData.length} rows)`);
  }
}

run().catch(console.error);
