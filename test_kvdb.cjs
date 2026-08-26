process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
  console.log("=== CREATING KVDB BUCKET FOR SUPERMACHO ===");

  // 1. Create bucket with email
  const createRes = await fetch('https://kvdb.io/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'email=admin@supermacho.app'
  });
  const bucketId = await createRes.text();
  console.log("NEW BUCKET ID:", bucketId);

  if (bucketId && !bucketId.includes('error')) {
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

    // 2. PUT key in new bucket
    const putRes = await fetch(`https://kvdb.io/${bucketId}/${userKey}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const putText = await putRes.text();
    console.log("PUT RESPONSE:", putText);

    // 3. GET key from new bucket
    const getRes = await fetch(`https://kvdb.io/${bucketId}/${userKey}`);
    const getData = await getRes.json();
    console.log("RETRIEVED FROM DATABASE:", JSON.stringify(getData, null, 2));
  }
}

run().catch(console.error);
