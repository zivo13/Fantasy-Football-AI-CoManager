process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== TESTING SUPABASE AUTH RETRIEVAL ===");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'zivo13@yahoo.com',
    password: '123456'
  });

  if (error) {
    console.log("LOGIN ERROR:", error.message);
  } else {
    console.log("LOGIN SUCCESSFUL!");
    console.log("RETRIEVED LEAGUES FROM DATABASE:", JSON.stringify(data.user.user_metadata.leagues, null, 2));

    // Now test updating the leagues in Supabase Postgres DB
    const updatedLeagues = [
      {
        id: "l_real_999888",
        name: "ESPN League #999888",
        platform: "ESPN",
        leagueId: "999888",
        teamId: "2",
        scoring: "PPR",
        espnS2: "AE_UPDATED_INCOGNITO_S2",
        swid: "{SWID_UPDATED_INCOGNITO}",
        status: "Connected & Synced"
      }
    ];

    const { data: upData, error: upErr } = await supabase.auth.updateUser({
      data: {
        leagues: updatedLeagues
      }
    });

    console.log("UPDATE LEAGUES RESULT:", upErr ? upErr.message : "SUCCESS!");

    // Check updated user_metadata
    console.log("NEW LEAGUES IN DB:", JSON.stringify(upData.user.user_metadata.leagues, null, 2));
  }
}

run().catch(console.error);
