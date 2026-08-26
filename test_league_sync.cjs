const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  console.log("=== TESTING LEAGUE SYNC API ===");

  const testLeagues = [
    {
      id: 'l_test_123',
      name: 'ESPN League #8492019',
      platform: 'ESPN',
      leagueId: '8492019',
      teamId: '3',
      scoring: 'PPR',
      espnS2: 'AE_TEST_COOKIE_S2',
      swid: '{TEST_SWID_123}',
      status: 'Connected & Synced'
    }
  ];

  // 1. Save league via POST
  const saveRes = await fetch('http://localhost:3000/api/register-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'zivo13@yahoo.com',
      leagues: testLeagues
    })
  });

  const saveData = await saveRes.json();
  console.log("SAVE RESPONSE:", saveData);

  // 2. Fetch via LOGIN action
  const loginRes = await fetch('http://localhost:3000/api/register-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'zivo13@yahoo.com',
      action: 'login'
    })
  });

  const loginData = await loginRes.json();
  console.log("LOGIN RESPONSE:", JSON.stringify(loginData, null, 2));
}

run().catch(console.error);
