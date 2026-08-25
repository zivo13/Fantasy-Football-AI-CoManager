process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== UPSERTING SEED PROFILES WITH BASIC SCHEMA ===");
  
  const seedUsers = [
    { email: 'zivo13@yahoo.com', role: 'admin', plan_id: 'commissioner' },
    { email: 'zivo13@hotmail.com', role: 'client', plan_id: 'free' },
    { email: 'doctorluismoralesae@gmail.com', role: 'client', plan_id: 'free' }
  ];

  for (const user of seedUsers) {
    const { data: upsertData, error: upsertErr } = await supabase.from('profiles').upsert(user, { onConflict: 'email' });
    console.log(`UPSERT ${user.email} -> error:`, upsertErr);
  }

  const { data: selectData, error: selectErr } = await supabase.from('profiles').select('*');
  console.log("SELECT AFTER UPSERT error:", selectErr);
  console.log("SELECT AFTER UPSERT data:", JSON.stringify(selectData, null, 2));
}

run();
