process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdmryhxmfgedfdleytwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== TESTING SUPABASE BUCKET STORAGE ===");

  // 1. List buckets
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log("BUCKETS LIST:", bErr ? bErr.message : buckets);

  // 2. Try creating bucket or writing to 'public'
  const testPayload = JSON.stringify({
    "zivo13@yahoo.com": [
      {
        id: "l_real_999888",
        name: "ESPN League #999888",
        platform: "ESPN",
        leagueId: "999888",
        teamId: "2",
        scoring: "PPR",
        espnS2: "AE_TEST_STORAGE_S2",
        swid: "{SWID_TEST_STORAGE}"
      }
    ]
  });

  const { data: uploadData, error: uploadErr } = await supabase.storage.from('app_data').upload('user_leagues.json', testPayload, { upsert: true });
  console.log("UPLOAD ERROR:", uploadErr);
  console.log("UPLOAD DATA:", uploadData);
}

run().catch(console.error);
