process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
  console.log("=== TESTING MYJSON PERSISTENT CLOUD DB ===");

  const payload = {
    "zivo13@yahoo.com": [
      {
        id: "l_real_999888",
        name: "ESPN League #999888",
        platform: "ESPN",
        leagueId: "999888",
        teamId: "2",
        scoring: "PPR",
        espnS2: "AE_PERSISTENT_MYJSON_S2",
        swid: "{SWID_PERSISTENT_MYJSON}",
        status: "Connected & Synced"
      }
    ]
  };

  // 1. Create record
  const postRes = await fetch('https://api.myjson.online/v1/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonData: payload })
  });

  const postData = await postRes.json();
  console.log("POST DATA:", postData);
}

run().catch(console.error);
