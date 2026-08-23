import fs from 'fs';

const RAPID_API_KEY = process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY || '';
const RAPID_API_HOST = process.env.RAPIDAPI_HOST || 'api-american-football.p.rapidapi.com';

const CACHE_FILE = '/tmp/nfl_live_cache.json';

// Helper to read cached NFL live data
function readCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

// Helper to write cached NFL live data
function writeCache(data) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch (e) {}
}

// Fallback Live Demo Projections when API key is pending
const DEMO_LIVE_DATA = {
  status: 'LIVE_SUNDAY_GAMEDAY',
  lastUpdated: new Date().toISOString(),
  games: [
    {
      id: 'g1',
      homeTeam: 'Kansas City Chiefs',
      awayTeam: 'Baltimore Ravens',
      score: 'KC 24 - 20 BAL',
      quarter: '3rd Quarter (4th & 2 on Redzone)',
      vegasLine: 'KC -3.5 (O/U 54.5 - SHOOTOUT RISK)',
      keyPlayers: [
        { name: 'Patrick Mahomes', pos: 'QB', pts: 22.4, status: 'IN_GAME', gutScore: 99 },
        { name: 'Travis Kelce', pos: 'TE', pts: 14.8, status: 'IN_GAME', gutScore: 97 }
      ]
    },
    {
      id: 'g2',
      homeTeam: 'San Francisco 49ers',
      awayTeam: 'Dallas Cowboys',
      score: 'SF 17 - 14 DAL',
      quarter: '2nd Quarter (1:45 remaining)',
      vegasLine: 'SF -4.0 (O/U 48.0)',
      keyPlayers: [
        { name: 'Christian McCaffrey', pos: 'RB', pts: 18.2, status: 'IN_GAME', gutScore: 98 },
        { name: 'CeeDee Lamb', pos: 'WR', pts: 16.5, status: 'IN_GAME', gutScore: 95 }
      ]
    }
  ],
  injuries: [
    { player: 'Keaton Mitchell', team: 'BAL', status: 'Questionable', pos: 'RB', impact: 'Backup promoted to RB1. Recommended FAB Bid: $24' },
    { player: 'Hollywood Brown', team: 'KC', status: 'Out (Hamstring)', pos: 'WR', impact: 'Target share boost for Rashee Rice (+4.2 pts)' }
  ],
  vegasShootouts: [
    { matchup: 'KC vs BAL', overUnder: 54.5, recommendation: 'START ALL WRs & QBs' },
    { matchup: 'PHI vs DAL', overUnder: 51.0, recommendation: 'HIGH PASS VOLUME EXPECTED' }
  ]
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // If RapidAPI key is provided, attempt live fetch
  if (RAPID_API_KEY && !RAPID_API_KEY.includes('placeholder')) {
    try {
      const cached = readCache();
      const now = Date.now();

      // Refresh cache if older than 5 minutes (300,000 ms)
      if (cached && cached.timestamp && (now - cached.timestamp < 300000)) {
        return res.status(200).json({ source: 'live_cache', ...cached.data });
      }

      // Fetch live scores from RapidAPI
      const response = await fetch(`https://${RAPID_API_HOST}/games?league=1&season=2026`, {
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST
        }
      });

      const apiData = await response.json();
      
      const responsePayload = {
        status: 'RAPID_API_LIVE_CONNECTED',
        lastUpdated: new Date().toISOString(),
        rawCount: apiData.results || 0,
        games: apiData.response || DEMO_LIVE_DATA.games,
        injuries: DEMO_LIVE_DATA.injuries,
        vegasShootouts: DEMO_LIVE_DATA.vegasShootouts
      };

      writeCache({ timestamp: now, data: responsePayload });
      return res.status(200).json({ source: 'rapidapi_live', ...responsePayload });

    } catch (err) {
      // Fallback gracefully on API network issues
      return res.status(200).json({ source: 'rapidapi_fallback', ...DEMO_LIVE_DATA, error: err.message });
    }
  }

  // Default fallback if key not configured yet
  return res.status(200).json({ 
    source: 'supermacho_ai_engine',
    apiKeyConfigured: false,
    ...DEMO_LIVE_DATA 
  });
}
