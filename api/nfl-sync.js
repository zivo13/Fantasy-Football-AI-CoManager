import fs from 'fs';

const CRED_FILE = '/tmp/supermacho_rapidapi.json';
const CACHE_FILE = '/tmp/nfl_live_cache.json';

// Helper to read server-persisted credentials
function readCredentials() {
  try {
    if (fs.existsSync(CRED_FILE)) {
      const raw = fs.readFileSync(CRED_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {}
  return {
    key: process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY || '',
    host: process.env.RAPIDAPI_HOST || 'nfl-api-data.p.rapidapi.com'
  };
}

// Helper to write server-persisted credentials
function saveCredentials(creds) {
  try {
    fs.writeFileSync(CRED_FILE, JSON.stringify(creds));
  } catch (e) {}
}

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST: Persist RapidAPI credentials on server
  if (req.method === 'POST') {
    try {
      const { key, host } = req.body || {};
      const currentCreds = readCredentials();
      const newCreds = {
        key: key !== undefined ? key.trim() : currentCreds.key,
        host: host !== undefined ? host.trim() : currentCreds.host
      };
      saveCredentials(newCreds);
      return res.status(200).json({ success: true, credentials: newCreds });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Handle GET: Fetch official ESPN Real-Time Scoreboard & Breaking NFL News
  const activeCreds = readCredentials();
  const apiKey = activeCreds.key;
  const apiHost = activeCreds.host || 'nfl-api-data.p.rapidapi.com';

  const cached = readCache();
  const now = Date.now();

  // Return cache if fresh (under 3 minutes)
  if (cached && cached.timestamp && (now - cached.timestamp < 180000)) {
    return res.status(200).json({ source: 'espn_live_cache', credentials: activeCreds, ...cached.data });
  }

  try {
    // 1. Fetch Official ESPN Real-Time Scoreboard / Schedules
    const espnScoresRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    const espnScoresData = await espnScoresRes.json();

    // 2. Fetch Official ESPN Breaking NFL News & Injury Reports
    const espnNewsRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/news');
    const espnNewsData = await espnNewsRes.json();

    // Parse Real ESPN Events
    const rawEvents = espnScoresData.events || [];
    const realGames = rawEvents.map(evt => {
      const competition = evt.competitions?.[0] || {};
      const competitors = competition.competitors || [];
      const home = competitors.find(c => c.homeAway === 'home') || {};
      const away = competitors.find(c => c.homeAway === 'away') || {};
      const status = evt.status?.type || {};

      return {
        id: evt.id,
        name: evt.name,
        shortName: evt.shortName,
        date: evt.date,
        statusState: status.state, // 'pre', 'in', 'post'
        statusDetail: status.detail || status.description || 'Upcoming Game',
        isLive: status.state === 'in',
        isCompleted: status.state === 'post',
        hasScore: status.state === 'in' || status.state === 'post',
        homeTeam: home.team?.displayName || 'Home Team',
        homeAbbrev: home.team?.abbreviation || 'HOME',
        homeScore: home.score || '0',
        homeLogo: home.team?.logo || '',
        awayTeam: away.team?.displayName || 'Away Team',
        awayAbbrev: away.team?.abbreviation || 'AWAY',
        awayScore: away.score || '0',
        awayLogo: away.logo || '',
        odds: competition.odds?.[0]?.details || 'Line TBD'
      };
    });

    // Parse Real ESPN Breaking Headlines
    const rawArticles = espnNewsData.articles || [];
    const realHeadlines = rawArticles.slice(0, 5).map(art => ({
      id: art.id || Math.random(),
      headline: art.headline,
      description: art.description,
      published: art.published,
      link: art.links?.web?.href || ''
    }));

    // If user provided RapidAPI key, attempt optional RapidAPI enrichment
    let rapidData = null;
    if (apiKey && !apiKey.includes('placeholder')) {
      try {
        let targetPath = '/games?league=1&season=2026';
        if (apiHost.includes('nfl-api-data')) targetPath = '/nfl-schedules';
        
        const rRes = await fetch(`https://${apiHost}${targetPath}`, {
          headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': apiHost }
        });
        rapidData = await rRes.json();
      } catch (e) {}
    }

    const draftPlayers = [
      { id: 'p1', name: 'Christian McCaffrey', pos: 'RB', team: 'SF', adp: '1.01', projPts: 312.4, floor: 18.2, ceiling: 34.5, upsideTier: 'S-TIER ELITE', valueSteal: 'CONSENSUS #1 PICK', needMatch: true },
      { id: 'p2', name: 'CeeDee Lamb', pos: 'WR', team: 'DAL', adp: '1.02', projPts: 294.8, floor: 16.5, ceiling: 31.0, upsideTier: 'S-TIER ELITE', valueSteal: 'CONSENSUS #2 PICK', needMatch: false },
      { id: 'p3', name: 'Breece Hall', pos: 'RB', team: 'NYJ', adp: '1.08', projPts: 268.4, floor: 14.2, ceiling: 26.5, upsideTier: 'S-TIER ELITE', valueSteal: '+4 Picks Value', needMatch: true },
      { id: 'p4', name: 'Bijan Robinson', pos: 'RB', team: 'ATL', adp: '1.09', projPts: 262.1, floor: 13.8, ceiling: 25.1, upsideTier: 'S-TIER ELITE', valueSteal: '+2 Picks Value', needMatch: true },
      { id: 'p5', name: 'Ja\'Marr Chase', pos: 'WR', team: 'CIN', adp: '1.04', projPts: 282.0, floor: 15.1, ceiling: 32.4, upsideTier: 'WR1 OVERALL CEILING', valueSteal: 'TOP 5 ANCHOR', needMatch: false },
      { id: 'p6', name: 'Malik Nabers', pos: 'WR', team: 'NYG', adp: '2.04', projPts: 224.5, floor: 11.5, ceiling: 22.8, upsideTier: 'BREAKOUT UPSIDE', valueSteal: '+6 Picks Value', needMatch: false },
      { id: 'p7', name: 'Marvin Harrison Jr.', pos: 'WR', team: 'ARI', adp: '2.06', projPts: 218.9, floor: 10.9, ceiling: 23.4, upsideTier: 'BREAKOUT UPSIDE', valueSteal: '+3 Picks Value', needMatch: false },
      { id: 'p8', name: 'Lamar Jackson', pos: 'QB', team: 'BAL', adp: '3.02', projPts: 342.1, floor: 18.5, ceiling: 32.0, upsideTier: 'KONAMI CODE QB', valueSteal: 'Fair Value', needMatch: false },
      { id: 'p9', name: 'Trey McBride', pos: 'TE', team: 'ARI', adp: '4.05', projPts: 184.2, floor: 9.4, ceiling: 19.8, upsideTier: 'ELITE TARGET SHARE', valueSteal: '+8 Picks Value', needMatch: true },
      { id: 'p10', name: 'Kenneth Walker III', pos: 'RB', team: 'SEA', adp: '4.10', projPts: 204.8, floor: 10.1, ceiling: 21.5, upsideTier: 'TOUCHDOWN CEILING', valueSteal: '+5 Picks Value', needMatch: true },
      { id: 'p11', name: 'Jayden Daniels', pos: 'QB', team: 'WAS', adp: '6.04', projPts: 298.5, floor: 14.0, ceiling: 28.5, upsideTier: 'RUSHING UPSIDE GEM', valueSteal: 'ROUND 6 STEAL', needMatch: false }
    ];

    const payload = {
      status: 'REAL_ESPN_LIVE_SYNCED',
      lastUpdated: new Date().toISOString(),
      seasonWeek: espnScoresData.week?.text || 'Official NFL Schedule',
      seasonYear: espnScoresData.season?.year || 2026,
      gameCount: realGames.length,
      games: realGames,
      headlines: realHeadlines,
      draftPlayers: draftPlayers,
      rapidEnriched: !!rapidData
    };

    writeCache({ timestamp: now, data: payload });
    return res.status(200).json({ source: 'official_espn_realtime', credentials: activeCreds, ...payload });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
