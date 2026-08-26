process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
  console.log("=== TESTING NPOINT PUBLIC PERSISTENT DB ===");

  const payload = {
    users: [
      {
        user: "zivo13@yahoo.com",
        leagues: [
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
        ]
      }
    ]
  };

  // 1. POST to npoint.io
  const postRes = await fetch('https://api.npoint.io', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const postData = await postRes.json();
  console.log("POST DATA:", postData);

  if (postData && postData.id) {
    const binId = postData.id;
    console.log("BIN CREATED ID:", binId);

    // 2. GET from npoint.io
    const getRes = await fetch(`https://api.npoint.io/${binId}`);
    const getData = await getRes.json();
    console.log("GET DATA:", getData);

    // 3. POST update to npoint.io
    payload.users.push({
      user: "doctorluismoralesae@gmail.com",
      leagues: [
        {
          id: "l_doc_123",
          name: "ESPN League #8492019",
          platform: "ESPN",
          leagueId: "8492019",
          teamId: "1",
          scoring: "PPR"
        }
      ]
    });

    const putRes = await fetch(`https://api.npoint.io/${binId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const putData = await putRes.json();
    console.log("PUT DATA:", putData);
  }
}

run().catch(console.error);
