process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== TESTING SUPABASE AUTH USER_METADATA PERSISTENCE ===");

  const testEmail = 'zivo13@yahoo.com';
  const testPass = '123456';
  const testLeagues = [
    {
      id: "l_real_8492019",
      name: "ESPN League #8492019",
      platform: "ESPN",
      leagueId: "8492019",
      teamId: "3",
      scoring: "PPR",
      espnS2: "AE_PERSISTENT_PRO_S2",
      swid: "{SWID_PERSISTENT_PRO}",
      status: "Connected & Synced"
    }
  ];

  // 1. Attempt login with Supabase Auth
  let { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass
  });

  if (loginErr) {
    console.log("LOGIN ERR (trying signup):", loginErr.message);
    const { data: signData, error: signErr } = await supabase.auth.signUp({
      email: testEmail,
      password: testPass,
      options: {
        data: {
          leagues: testLeagues
        }
      }
    });
    console.log("SIGNUP RESULT:", signErr ? signErr.message : "SUCCESS!");
    loginData = signData;
  } else {
    console.log("LOGIN SUCCESS! USER METADATA:", loginData.user.user_metadata);
    
    // Update user_metadata in Supabase Auth DB
    const { data: updateData, error: updateErr } = await supabase.auth.updateUser({
      data: {
        leagues: testLeagues
      }
    });
    console.log("UPDATE USER METADATA RESULT:", updateErr ? updateErr.message : "UPDATE SUCCESS!");
  }
}

run().catch(console.error);
