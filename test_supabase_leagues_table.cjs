process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== TESTING SUPABASE LEAGUES TABLE INSERT & SELECT ===");

  const testRecord = {
    user_email: 'zivo13@yahoo.com',
    platform: 'ESPN',
    league_id: '8492019',
    team_id: '3',
    scoring: 'PPR',
    espn_s2: 'AE_TEST_S2',
    swid: '{SWID_TEST}'
  };

  const { data: insData, error: insErr } = await supabase.from('leagues').insert([testRecord]);
  console.log("INSERT ERROR:", insErr);
  console.log("INSERT DATA:", insData);

  const { data: selData, error: selErr } = await supabase.from('leagues').select('*');
  console.log("SELECT ERROR:", selErr);
  console.log("SELECT DATA:", JSON.stringify(selData, null, 2));
}

run().catch(console.error);
