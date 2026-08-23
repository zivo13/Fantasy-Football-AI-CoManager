// Mock data for SuperMacho SaaS Application

export const INITIAL_PLANS = [
  {
    id: 'free',
    name: 'Free Rookie',
    badge: 'FREE FOREVER',
    priceMonthly: 0,
    priceSeasonal: 0,
    currency: '$',
    description: 'Get a taste of SuperMacho AI for 1 league.',
    features: [
      '1 Fantasy League (ESPN or Sleeper)',
      'Weekly Start/Sit Recommendations',
      'Top 3 Waiver Wire Pickups',
      'Basic Roster Health Check',
      'SuperMacho AI Assistant (5 queries/day)'
    ],
    popular: false,
    ctaText: 'Start Free',
    stripePriceId: 'price_free_rookie',
    maxLeagues: 1,
    tradeAnalyzer: false,
    gameDayAlerts: false
  },
  {
    id: 'pro',
    name: 'Pro Champion',
    badge: 'MOST POPULAR',
    priceMonthly: 4.99,
    priceSeasonal: 29.99,
    currency: '$',
    description: 'The ultimate tool set to dominate up to 3 competitive leagues.',
    features: [
      'Up to 3 Fantasy Leagues',
      'Real-time Start/Sit Matchup Heatmaps',
      'Full Waiver Wire Target Priority Rankings',
      'Interactive Trade Evaluator & Calculator',
      'Game-day Discord & Email Alerts',
      'SuperMacho AI Assistant (Unlimited)'
    ],
    popular: true,
    ctaText: 'Become a Champion',
    stripePriceId: 'price_pro_champion',
    maxLeagues: 3,
    tradeAnalyzer: true,
    gameDayAlerts: true
  },
  {
    id: 'commissioner',
    name: 'SuperMacho Commissioner',
    badge: 'HIGH ROLLER',
    priceMonthly: 9.99,
    priceSeasonal: 59.99,
    currency: '$',
    description: 'Unlimited leagues, multi-platform dominance & live draft assistant.',
    features: [
      'UNLIMITED Fantasy Leagues',
      'ESPN, Sleeper & Yahoo Integration',
      'Live War-Room Draft Assistant',
      'Opponent Roster Weakness Finder',
      'Win Probability Boost Calculator',
      'Priority VIP AI Server Engine'
    ],
    popular: false,
    ctaText: 'Go Commissioner Mode',
    stripePriceId: 'price_commissioner',
    maxLeagues: 999,
    tradeAnalyzer: true,
    gameDayAlerts: true
  }
];

export const DEMO_ROSTER = [
  { id: 'p1', name: 'Patrick Mahomes', pos: 'QB', team: 'KC', matchup: 'vs LAC', proj: 22.4, status: 'START', matchScore: '98%', rank: '#1 QB', photo: '🏈' },
  { id: 'p2', name: 'Christian McCaffrey', pos: 'RB', team: 'SF', matchup: 'vs LAR', proj: 21.8, status: 'START', matchScore: '96%', rank: '#1 RB', photo: '🏃' },
  { id: 'p3', name: 'Breece Hall', pos: 'RB', team: 'NYJ', matchup: '@ NE', proj: 16.5, status: 'START', matchScore: '89%', rank: '#6 RB', photo: '🏃' },
  { id: 'p4', name: 'Justin Jefferson', pos: 'WR', team: 'MIN', matchup: 'vs GB', proj: 19.2, status: 'START', matchScore: '94%', rank: '#2 WR', photo: '⚡' },
  { id: 'p5', name: 'CeeDee Lamb', pos: 'WR', team: 'DAL', matchup: '@ NYG', proj: 18.1, status: 'START', matchScore: '92%', rank: '#4 WR', photo: '⚡' },
  { id: 'p6', name: 'Travis Kelce', pos: 'TE', team: 'KC', matchup: 'vs LAC', proj: 14.3, status: 'START', matchScore: '88%', rank: '#2 TE', photo: '🎯' },
  { id: 'p7', name: 'Amon-Ra St. Brown', pos: 'FLEX', team: 'DET', matchup: 'vs CHI', proj: 15.8, status: 'START', matchScore: '90%', rank: '#7 WR', photo: '🔥' },
  { id: 'p8', name: '49ers Defense', pos: 'D/ST', team: 'SF', matchup: 'vs LAR', proj: 8.5, status: 'START', matchScore: '82%', rank: '#3 DST', photo: '🛡️' },
  { id: 'p9', name: 'Harrison Butker', pos: 'K', team: 'KC', matchup: 'vs LAC', proj: 8.1, status: 'START', matchScore: '85%', rank: '#4 K', photo: '👟' },
  
  // BENCH PLAYERS
  { id: 'p10', name: 'Tee Higgins', pos: 'WR', team: 'CIN', matchup: '@ BAL', proj: 11.2, status: 'BENCH', matchScore: '74%', rank: '#28 WR', photo: '⚡' },
  { id: 'p11', name: 'Javonte Williams', pos: 'RB', team: 'DEN', matchup: 'vs LV', proj: 9.8, status: 'BENCH', matchScore: '68%', rank: '#31 RB', photo: '🏃' },
  { id: 'p12', name: 'C.J. Stroud', pos: 'QB', team: 'HOU', matchup: '@ IND', proj: 17.6, status: 'BENCH', matchScore: '84%', rank: '#9 QB', photo: '🏈' }
];

export const DEMO_WAIVERS = [
  { id: 'w1', name: 'Kimani Vidal', pos: 'RB', team: 'LAC', rostered: '18%', fabBid: '$14 (15%)', priority: 'HIGH UPSIDE', summary: 'Starter Gus Edwards banged up. Vidal has 20-touch potential against weak run defense.' },
  { id: 'w2', name: 'Jalen McMillan', pos: 'WR', team: 'TB', rostered: '12%', fabBid: '$8 (9%)', priority: 'SOLID FLEX', summary: 'Target share increased 24% over past 2 weeks. Great slot matchup this Sunday.' },
  { id: 'w3', name: 'Drake Maye', pos: 'QB', team: 'NE', rostered: '22%', fabBid: '$5 (6%)', priority: 'STREAMER', summary: 'Dual-threat QB upside with 45 rushing yards per game floor.' }
];

export const DEMO_TRADE_SCENARIO = {
  give: [
    { name: 'Tee Higgins', pos: 'WR', projPts: 11.2 },
    { name: 'Javonte Williams', pos: 'RB', projPts: 9.8 }
  ],
  receive: [
    { name: 'Malik Nabers', pos: 'WR', projPts: 16.4 }
  ],
  winProbabilityBefore: 54,
  winProbabilityAfter: 63,
  verdict: 'SMART TRADE! 🏆',
  analysis: 'SuperMacho verdict: You give up bench depth to acquire a true WR1 alpha target monster. Your starting lineup gains +5.4 projected points per week!'
};

export const ADMIN_METRICS = {
  mrr: 14850,
  arr: 178200,
  activeSubscribers: 1840,
  totalUsers: 4920,
  conversionRate: '37.4%',
  recentSubscriptions: []
};
