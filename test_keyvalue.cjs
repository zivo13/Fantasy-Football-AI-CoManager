process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
  console.log("=== TESTING KEYVALUE.XYZ PERSISTENT DATABASE ===");

  // 1. Create a key token
  const tokenRes = await fetch('https://api.keyvalue.xyz/new/supermacho_db');
  const tokenUrl = await tokenRes.text();
  console.log("TOKEN URL:", tokenUrl);

  const parts = tokenUrl.trim().split('/');
  const token = parts[parts.length - 1];
  console.log("TOKEN ID:", token);

  if (token) {
    const userKey = 'zivo13_yahoo_com';
    const payload = [
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

    // 2. POST key value
    const postRes = await fetch(`https://api.keyvalue.xyz/${token}/${userKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log("POST STATUS:", postRes.status);

    // 3. GET key value
    const getRes = await fetch(`https://api.keyvalue.xyz/${token}/${userKey}`);
    const getData = await getRes.json();
    console.log("RETRIEVED DATA FROM DATABASE:", JSON.stringify(getData, null, 2));
  }
}

run().catch(console.error);
