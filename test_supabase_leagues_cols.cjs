process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== TESTING SUPABASE LEAGUES TABLE KEYS ===");

  const candidateKeys = ['id', 'user_id', 'email', 'name', 'platform', 'league_id', 'created_at', 'data', 'config', 'payload', 'settings', 'user'];

  for (const key of candidateKeys) {
    const { error } = await supabase.from('leagues').insert([{ [key]: 'test_val' }]);
    if (error) {
      console.log(`Key [${key}]:`, error.message);
    } else {
      console.log(`Key [${key}]: VALID COLUMN!`);
    }
  }
}

run().catch(console.error);
