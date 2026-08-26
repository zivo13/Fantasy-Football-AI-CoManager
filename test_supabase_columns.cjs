process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== TESTING SUPABASE PROFILES BASIC UPSERT ===");

  const { data: upsertData, error: upsertErr } = await supabase.from('profiles').upsert({
    email: 'zivo13@yahoo.com',
    role: 'admin',
    plan_id: 'commissioner'
  }, { onConflict: 'email' });

  console.log("UPSERT ERROR:", upsertErr);
  console.log("UPSERT DATA:", upsertData);

  const { data: selData, error: selErr } = await supabase.from('profiles').select('*');
  console.log("SELECT ERROR:", selErr);
  console.log("SELECT DATA:", JSON.stringify(selData, null, 2));
}

run().catch(console.error);
