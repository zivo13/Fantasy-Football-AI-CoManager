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
      { id: 'p1', name: 'Ja\'Marr Chase', pos: 'WR', team: 'CIN', bye: 12, adp: '1.01', projPts: 318.5, floor: 17.5, ceiling: 35.0, upsideTier: 'WR1 OVERALL', valueSteal: 'CONSENSUS #1 PICK', needMatch: false },
      { id: 'p2', name: 'Bijan Robinson', pos: 'RB', team: 'ATL', bye: 12, adp: '1.02', projPts: 298.2, floor: 15.8, ceiling: 30.1, upsideTier: 'RB1 OVERALL', valueSteal: 'TOP RB ANCHOR', needMatch: true },
      { id: 'p3', name: 'Saquon Barkley', pos: 'RB', team: 'PHI', bye: 5, adp: '1.03', projPts: 292.0, floor: 15.2, ceiling: 29.5, upsideTier: 'S-TIER VOLUME', valueSteal: 'TOP 3 PICK', needMatch: true },
      { id: 'p4', name: 'Breece Hall', pos: 'RB', team: 'NYJ', bye: 12, adp: '1.04', projPts: 286.4, floor: 14.8, ceiling: 28.2, upsideTier: 'S-TIER ELITE', valueSteal: '+2 Picks Value', needMatch: true },
      { id: 'p5', name: 'Justin Jefferson', pos: 'WR', team: 'MIN', bye: 6, adp: '1.05', projPts: 290.1, floor: 15.5, ceiling: 31.2, upsideTier: 'ELITE TARGET SHARE', valueSteal: 'TOP 5 WR', needMatch: false },
      { id: 'p6', name: 'CeeDee Lamb', pos: 'WR', team: 'DAL', bye: 7, adp: '1.06', projPts: 288.5, floor: 15.0, ceiling: 30.5, upsideTier: 'ELITE TARGET SHARE', valueSteal: 'TOP 6 WR', needMatch: false },
      { id: 'p7', name: 'Amon-Ra St. Brown', pos: 'WR', team: 'DET', bye: 5, adp: '1.07', projPts: 275.2, floor: 14.5, ceiling: 27.8, upsideTier: 'HIGH FLOOR ANCHOR', valueSteal: 'ROUND 1 ANCHOR', needMatch: false },
      { id: 'p8', name: 'Malik Nabers', pos: 'WR', team: 'NYG', bye: 11, adp: '1.08', projPts: 264.5, floor: 13.2, ceiling: 28.0, upsideTier: 'BREAKOUT SUPERSTAR', valueSteal: '+4 Picks Value', needMatch: false },
      { id: 'p9', name: 'Derrick Henry', pos: 'RB', team: 'BAL', bye: 14, adp: '1.09', projPts: 272.0, floor: 14.0, ceiling: 29.0, upsideTier: 'TOUCHDOWN MONSTER', valueSteal: '+3 Picks Value', needMatch: true },
      { id: 'p10', name: 'Jahmyr Gibbs', pos: 'RB', team: 'DET', bye: 5, adp: '1.10', projPts: 265.8, floor: 13.5, ceiling: 28.4, upsideTier: 'DYNAMIC EXPLOSIVE', valueSteal: '+2 Picks Value', needMatch: true },
      { id: 'p11', name: 'Nico Collins', pos: 'WR', team: 'HOU', bye: 14, adp: '1.11', projPts: 258.4, floor: 12.8, ceiling: 27.5, upsideTier: 'ALPHA WR1', valueSteal: 'ROUND 1 VALUE', needMatch: false },
      { id: 'p12', name: 'Puka Nacua', pos: 'WR', team: 'LAR', bye: 6, adp: '1.12', projPts: 255.0, floor: 12.5, ceiling: 26.8, upsideTier: 'TARGET MONSTER', valueSteal: 'ROUND 1 VALUE', needMatch: false },
      { id: 'p13', name: 'Garrett Wilson', pos: 'WR', team: 'NYJ', bye: 12, adp: '2.01', projPts: 248.0, floor: 12.0, ceiling: 26.0, upsideTier: 'ALPHA TARGET SHARE', valueSteal: '+3 Picks Value', needMatch: false },
      { id: 'p14', name: 'Brian Thomas Jr.', pos: 'WR', team: 'JAX', bye: 12, adp: '2.02', projPts: 242.5, floor: 11.8, ceiling: 26.5, upsideTier: 'BREAKOUT SPEEDSTAR', valueSteal: '+5 Picks Value', needMatch: false },
      { id: 'p15', name: 'Marvin Harrison Jr.', pos: 'WR', team: 'ARI', bye: 11, adp: '2.03', projPts: 238.9, floor: 11.2, ceiling: 25.4, upsideTier: 'BREAKOUT UPSIDE', valueSteal: '+4 Picks Value', needMatch: false },
      { id: 'p16', name: 'Josh Allen', pos: 'QB', team: 'BUF', bye: 12, adp: '2.04', projPts: 365.2, floor: 19.5, ceiling: 35.0, upsideTier: 'QB1 OVERALL', valueSteal: 'QB1 ANCHOR', needMatch: false },
      { id: 'p17', name: 'Lamar Jackson', pos: 'QB', team: 'BAL', bye: 14, adp: '2.05', projPts: 358.0, floor: 19.0, ceiling: 34.0, upsideTier: 'KONAMI CODE QB', valueSteal: 'QB2 ANCHOR', needMatch: false },
      { id: 'p18', name: 'Jonathan Taylor', pos: 'RB', team: 'IND', bye: 14, adp: '2.06', projPts: 245.0, floor: 12.2, ceiling: 26.0, upsideTier: 'WORKHORSE RB', valueSteal: '+4 Picks Value', needMatch: true },
      { id: 'p19', name: 'De\'Von Achane', pos: 'RB', team: 'MIA', bye: 6, adp: '2.07', projPts: 240.2, floor: 11.5, ceiling: 29.8, upsideTier: 'HOME RUN CEILING', valueSteal: '+5 Picks Value', needMatch: true },
      { id: 'p20', name: 'Kyren Williams', pos: 'RB', team: 'LAR', bye: 6, adp: '2.08', projPts: 236.5, floor: 11.8, ceiling: 24.5, upsideTier: 'REDZONE TOUCHES', valueSteal: '+3 Picks Value', needMatch: true },
      { id: 'p21', name: 'Josh Jacobs', pos: 'GB', team: 'GB', bye: 10, adp: '2.09', projPts: 230.1, floor: 11.0, ceiling: 24.0, upsideTier: 'WORKHORSE RB', valueSteal: '+4 Picks Value', needMatch: true },
      { id: 'p22', name: 'Kenneth Walker III', pos: 'RB', team: 'SEA', bye: 10, adp: '2.10', projPts: 225.4, floor: 10.8, ceiling: 23.5, upsideTier: 'TOUCHDOWN CEILING', valueSteal: '+5 Picks Value', needMatch: true },
      { id: 'p23', name: 'James Cook', pos: 'RB', team: 'BUF', bye: 12, adp: '2.11', projPts: 220.0, floor: 10.5, ceiling: 22.8, upsideTier: 'PASS CATCHER RB', valueSteal: '+6 Picks Value', needMatch: true },
      { id: 'p24', name: 'Chuba Hubbard', pos: 'RB', team: 'CAR', bye: 11, adp: '3.02', projPts: 210.5, floor: 10.0, ceiling: 21.5, upsideTier: 'HIGH VOLUME RB', valueSteal: 'ROUND 3 VALUE', needMatch: true },
      { id: 'p25', name: 'Chase Brown', pos: 'RB', team: 'CIN', bye: 12, adp: '3.05', projPts: 205.2, floor: 9.8, ceiling: 22.0, upsideTier: 'BREAKOUT RB', valueSteal: 'ROUND 3 STEAL', needMatch: true },
      { id: 'p26', name: 'Brock Bowers', pos: 'TE', team: 'LV', bye: 10, adp: '3.08', projPts: 215.4, floor: 10.5, ceiling: 23.0, upsideTier: 'TE1 OVERALL', valueSteal: 'TE1 ANCHOR', needMatch: false },
      { id: 'p27', name: 'Trey McBride', pos: 'TE', team: 'ARI', bye: 11, adp: '3.10', projPts: 208.2, floor: 10.0, ceiling: 21.8, upsideTier: 'ELITE TARGET SHARE', valueSteal: '+6 Picks Value', needMatch: false },
      { id: 'p28', name: 'Patrick Mahomes', pos: 'QB', team: 'KC', bye: 6, adp: '3.12', projPts: 332.0, floor: 17.5, ceiling: 30.0, upsideTier: 'PASSING YARD QB', valueSteal: 'ROUND 3 VALUE', needMatch: false },
      { id: 'p29', name: 'Jayden Daniels', pos: 'QB', team: 'WAS', bye: 14, adp: '4.02', projPts: 328.5, floor: 16.8, ceiling: 31.5, upsideTier: 'RUSHING UPSIDE GEM', valueSteal: '+8 Picks Value', needMatch: false },
      { id: 'p30', name: 'Christian McCaffrey', pos: 'RB', team: 'SF', bye: 9, adp: '4.04', projPts: 198.5, floor: 8.5, ceiling: 24.0, upsideTier: 'VETERAN RECOVERY', valueSteal: 'PICK #40 OVERALL', needMatch: true }
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
