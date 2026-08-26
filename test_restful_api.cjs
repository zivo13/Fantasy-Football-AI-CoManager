process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
  console.log("=== TESTING RESTFUL-API.DEV PERSISTENT DATABASE ===");

  const payload = {
    name: "supermacho_leagues_v1",
    data: {
      "zivo13@yahoo.com": [
        {
          id: "l_real_999888",
          name: "ESPN League #999888",
          platform: "ESPN",
          leagueId: "999888",
          teamId: "2",
          scoring: "PPR",
          espnS2: "AE_PERSISTENT_PRO_S2",
          swid: "{SWID_PERSISTENT_PRO}",
          status: "Connected & Synced"
        }
      ]
    }
  };

  // 1. Create persistent object
  const postRes = await fetch('https://api.restful-api.dev/objects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const postData = await postRes.json();
  console.log("POST DATA:", postData);

  if (postData && postData.id) {
    const objectId = postData.id;
    console.log("PERSISTENT OBJECT ID CREATED:", objectId);

    // 2. Fetch object by ID
    const getRes = await fetch(`https://api.restful-api.dev/objects/${objectId}`);
    const getData = await getRes.json();
    console.log("GET RETRIEVED DATA:", JSON.stringify(getData, null, 2));

    // 3. Update object by ID
    payload.data["doctorluismoralesae@gmail.com"] = [
      {
        id: "l_doc_123",
        name: "ESPN League #8492019",
        platform: "ESPN",
        leagueId: "8492019",
        teamId: "1",
        scoring: "PPR"
      }
    ];

    const putRes = await fetch(`https://api.restful-api.dev/objects/${objectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const putData = await putRes.json();
    console.log("PUT UPDATED DATA:", JSON.stringify(putData, null, 2));
  }
}

run().catch(console.error);
