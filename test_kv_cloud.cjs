const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  console.log("=== TESTING CLOUD PERSISTENT DATABASE STORAGE ===");

  const payload = {
    "zivo13@yahoo.com": [
      {
        id: "l_real_999",
        name: "ESPN League #8492019",
        platform: "ESPN",
        leagueId: "8492019",
        teamId: "3",
        scoring: "PPR",
        espnS2: "AE_PERSISTENT_PRO_S2",
        swid: "{SWID_PERSISTENT_PRO}",
        status: "Connected & Synced"
      }
    ]
  };

  // Test creating bin on jsonbin.io
  const res = await fetch('https://api.jsonbin.io/v3/b', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': '$2a$10$7841rPZJkZ3P.h9Ea0lQze3J5fN9b.9o9Yy.W.W4.0.0.0.0.0'
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log("RESPONSE:", text);
}

run().catch(console.error);
