import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Zap, Flame, Bot, Plus, Check, RefreshCw, AlertCircle, ArrowUpRight, Send, HelpCircle, Shield, Settings, Activity, Sparkles, TrendingUp, Award } from 'lucide-react';
import { CheckoutModal } from '../CheckoutModal';

export const ClientDashboard = () => {
  const { 
    leagues, 
    activeLeagueId, 
    setActiveLeagueId, 
    handleAddLeague, 
    demoRoster, 
    demoWaivers, 
    demoTrade,
    aiChatMessages,
    handleSendAiMessage,
    user,
    setUser
  } = useApp();

  const [activeTab, setActiveTab] = useState('lineup'); // 'lineup' | 'waivers' | 'trade' | 'chat'
  const [chatInput, setChatInput] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  const startCheckout = (name, price, id) => {
    setCheckoutPlan({ name, price, id });
    setShowCheckoutModal(true);
  };

  // Upgrade Plan handler
  const handleUpgradePlan = (newPlan, newPlanId) => {
    const cleanEmail = (user?.email || '').toLowerCase();
    
    // Update local React user state
    if (typeof setUser === 'function') {
      setUser(prev => ({
        ...prev,
        plan: newPlan,
        planId: newPlanId
      }));
    }

    // Save to localStorage credential store
    try {
      const userKey = `sm_user_${cleanEmail}`;
      const savedUserJson = localStorage.getItem(userKey);
      let savedUser = savedUserJson ? JSON.parse(savedUserJson) : { email: cleanEmail };
      savedUser.plan = newPlan;
      localStorage.setItem(userKey, JSON.stringify(savedUser));
    } catch (e) {}

    // Send global upgrade notification to Vercel API endpoint
    try {
      fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, plan: newPlan })
      });
    } catch (e) {}
  };

  // Form state for adding league parameters
  const [platform, setPlatform] = useState('ESPN');
  const [leagueIdInput, setLeagueIdInput] = useState('');
  const [teamIdInput, setTeamIdInput] = useState('');
  const [espnS2Input, setEspnS2Input] = useState('');
  const [swidInput, setSwidInput] = useState('');
  const [scoringInput, setScoringInput] = useState('PPR');

  const currentLeague = leagues.find(l => l.id === activeLeagueId) || leagues[0];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!leagueIdInput) return;
    handleAddLeague({
      name: `${platform} League #${leagueIdInput}`,
      platform,
      leagueId: leagueIdInput,
      teamId: teamIdInput || '1',
      scoring: scoringInput,
      espnS2: espnS2Input || 'Configured',
      swid: swidInput || 'Configured'
    });
    setLeagueIdInput('');
    setTeamIdInput('');
    setEspnS2Input('');
    setSwidInput('');
    setShowConfigModal(false);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    handleSendAiMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* STEP 1 ONBOARDING BANNER FOR NEW USERS */}
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 border-2 border-amber-500/50 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-amber-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bebas text-xl font-bold flex-shrink-0">
            01
          </div>
          <div>
            <div className="font-bebas text-xl text-white tracking-wider">STEP 1: CONNECT YOUR FANTASY LEAGUE</div>
            <p className="text-xs text-slate-300">Click the button to enter your ESPN or Sleeper League ID so SuperMacho AI can optimize your roster!</p>
          </div>
        </div>

        <button
          onClick={() => setShowConfigModal(true)}
          className="btn-gold px-6 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap shadow-lg uppercase"
        >
          <Plus className="w-4 h-4" />
          <span>Connect My League Now</span>
        </button>
      </div>
      <div className="glass-panel-gold p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-2 border-amber-500/40">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-0.5 rounded-full">
              PRO CHAMPION COMMAND CENTER
            </span>
            <span className="text-xs text-slate-400 font-bold">• WEEK 1 ACTIVATED</span>
          </div>
          <h1 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider">
            SUPERMACHO FANTASY CO-MANAGER
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">
            Active League: <span className="text-amber-400 font-bold">{currentLeague?.name}</span> ({currentLeague?.platform} - {currentLeague?.scoring})
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 z-10 w-full md:w-auto justify-end bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Your Subscription Tier</div>
            <div className="font-bebas text-xl text-amber-400">
              {user?.plan || (user?.planId === 'free' ? 'Free Rookie ($0/mo)' : 'Pro Champion ($4.99/mo)')}
            </div>
          </div>

          {(!user?.planId || user?.planId === 'free' || (user?.plan && user?.plan.includes('Free'))) ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => startCheckout('Pro Champion', '$4.99/mo', 'pro')}
                className="btn-gold px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade Pro ($4.99/mo)</span>
              </button>
              <button
                onClick={() => startCheckout('SuperMacho Commissioner', '$9.99/mo', 'commissioner')}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-lg whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Upgrade Commissioner ($9.99/mo)</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>PRO UNLOCKED</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lineup')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'lineup' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Optimal Lineup Trading Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('draft')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'draft' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Draft Day Strategy War Room</span>
          <span className="bg-slate-950 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-extrabold">NEW</span>
        </button>

        <button
          onClick={() => setActiveTab('waivers')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'waivers' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Waiver Dominator</span>
        </button>

        <button
          onClick={() => setActiveTab('trade')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'trade' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Trade Robbery Evaluator</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'chat' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-extrabold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>SuperMacho AI Assistant</span>
          <span className="bg-slate-950 text-cyan-400 text-[10px] px-1.5 py-0.2 rounded font-extrabold">LIVE</span>
        </button>
      </div>

      {/* TAB 1: OPTIMAL LINEUP ESPORTS TRADING CARDS */}
      {activeTab === 'lineup' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bebas text-3xl text-white tracking-wider">
              WEEK 1 START / SIT OPTIMAL TRADING CARDS
            </h3>
            <div className="text-xs font-bold text-amber-400 flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Projected Lineup Total: <strong className="text-white text-sm">144.7 Pts</strong></span>
            </div>
          </div>

          {/* DATA STATUS & TRADING CARDS EXPLANATION LEGEND */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  DEMO DATA MODE • REAL-TIME AI PROJECTIONS ACTIVE
                </span>
              </div>
              <button
                onClick={() => setShowConfigModal(true)}
                className="text-[11px] font-extrabold text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
              >
                <span>+ Connect Your Real ESPN / Sleeper Roster</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              💡 <strong className="text-white">Understanding Your Screen:</strong> Below is SuperMacho's AI-generated <strong>Start/Sit Matchup Matrix</strong>. 
              The <strong className="text-amber-400 font-bold">"GUT CHECK VALIDATED"</strong> rating (e.g. 98/100) measures defensive matchup vulnerability, target share, and weather factors. 
              <span className="text-slate-400 ml-1">If your ESPN/Sleeper parameters are pending, sample Week 1 projections are shown. Click the button above to sync your actual fantasy league!</span>
            </p>
          </div>

          {/* Starters Grid Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoRoster.filter(p => p.status === 'START').map((player) => (
              <div 
                key={player.id} 
                className="glass-panel p-5 rounded-3xl space-y-4 border-2 border-amber-500/30 hover:border-amber-500/80 transition-all duration-300 relative group overflow-hidden shadow-xl shadow-amber-500/5"
              >
                {/* Top Badge Overlay */}
                <div className="flex items-center justify-between">
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bebas text-sm px-3 py-0.5 rounded-lg font-bold">
                    {player.pos} • MUST START
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>GUT CHECK VALIDATED ({player.matchScore})</span>
                  </span>
                </div>

                {/* Player Card Header */}
                <div className="flex items-center gap-4 pt-1">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-amber-500/50 flex items-center justify-center text-3xl shadow-lg">
                    {player.photo}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-white leading-tight">{player.name}</h4>
                    <div className="text-xs text-slate-400 font-semibold">{player.team} ({player.matchup}) • {player.rank}</div>
                  </div>
                </div>

                {/* Matchup Heatbar Meter */}
                <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>MATCHUP FAVORABILITY</span>
                    <span className="text-amber-400">ELITE ADVANTAGE</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full" style={{ width: player.matchScore }}></div>
                  </div>
                </div>

                {/* Projection Pts & AI Pill */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Projected Points</div>
                    <div className="font-bebas text-3xl text-amber-400 leading-none">{player.proj} Pts</div>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-500 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md">
                      <Check className="w-3.5 h-3.5" />
                      <span>START SLOT</span>
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Bench Section */}
          <div className="pt-6 space-y-4">
            <h4 className="font-bebas text-2xl text-slate-300 tracking-wider">BENCH RESERVES</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoRoster.filter(p => p.status === 'BENCH').map((player) => (
                <div key={player.id} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{player.photo}</div>
                    <div>
                      <div className="font-bold text-sm text-white">{player.name}</div>
                      <div className="text-xs text-slate-400">{player.pos} • {player.team} ({player.matchup})</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bebas text-xl text-slate-400">{player.proj} Pts</div>
                    <span className="text-[10px] font-extrabold text-slate-500">BENCH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB: DRAFT DAY STRATEGY WAR ROOM */}
      {activeTab === 'draft' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bebas text-3xl text-white tracking-wider">
              DRAFT DAY STRATEGY WAR ROOM ({currentLeague?.scoring || 'PPR'})
            </h3>
            <div className="text-xs font-bold text-amber-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              Target Priority: <strong className="text-white">Hero RB + Value WR Stack</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Round 1-3 Targets */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 border-2 border-amber-500/40">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bebas text-2xl text-amber-400">ROUNDS 1 - 3</span>
                <span className="text-[10px] font-extrabold text-slate-950 bg-amber-400 px-2 py-0.5 rounded">ANCHOR STARTS</span>
              </div>
              <p className="text-xs text-slate-300">Target elite volume anchors with over 80% snap shares.</p>
              
              <div className="space-y-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Christian McCaffrey (RB - SF)</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ROUND 1 PICK</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Justin Jefferson (WR - MIN)</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ROUND 1 PICK</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Patrick Mahomes (QB - KC)</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">ROUND 3 PICK</span>
                </div>
              </div>
            </div>

            {/* Middle Round Value Steals */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 border-2 border-cyan-500/40">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bebas text-2xl text-cyan-400">ROUNDS 4 - 8</span>
                <span className="text-[10px] font-extrabold text-slate-950 bg-cyan-400 px-2 py-0.5 rounded">VALUE STEALS</span>
              </div>
              <p className="text-xs text-slate-300">Target high target-share WRs & pass-catching RBs.</p>
              
              <div className="space-y-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Jaylen Waddle (WR - MIA)</span>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">ROUND 4 PICK</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Isiah Pacheco (RB - KC)</span>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">ROUND 5 PICK</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Tee Higgins (WR - CIN)</span>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">ROUND 6 PICK</span>
                </div>
              </div>
            </div>

            {/* Late Round Sleeper Gems */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 border-2 border-emerald-500/40">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bebas text-2xl text-emerald-400">ROUNDS 9 - 15</span>
                <span className="text-[10px] font-extrabold text-slate-950 bg-emerald-400 px-2 py-0.5 rounded">SECRET SLEEPERS</span>
              </div>
              <p className="text-xs text-slate-300">Breakout RB hand-offs & high-upside rookies.</p>
              
              <div className="space-y-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Kimani Vidal (RB - LAC)</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">HIGH UPSIDE</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Jaylen Warren (RB - PIT)</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">BREAKOUT</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-xs text-white">Rome Odunze (WR - CHI)</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ROOKIE GEM</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
      {activeTab === 'waivers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bebas text-3xl text-white tracking-wider">
              HIGH-YIELD SECRET WAIVER TARGETS
            </h3>
            <span className="text-xs font-bold text-amber-400">Updated 5 minutes ago</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoWaivers.map((waiver) => (
              <div key={waiver.id} className="glass-panel p-6 rounded-3xl space-y-4 hover:border-amber-500/50 transition-all flex flex-col justify-between border-2 border-slate-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold px-3 py-1 rounded-lg">
                      {waiver.priority}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Rostered: {waiver.rostered}</span>
                  </div>

                  <div>
                    <h4 className="font-bebas text-3xl text-white tracking-wider">{waiver.name}</h4>
                    <p className="text-xs font-bold text-amber-400">{waiver.pos} • {waiver.team}</p>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">{waiver.summary}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Suggested FAB Bid</div>
                    <div className="font-bebas text-2xl text-emerald-400">{waiver.fabBid}</div>
                  </div>
                  <button className="btn-gold px-4 py-2.5 rounded-xl text-xs font-extrabold">
                    Claim Target
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRADE ROBBERY EVALUATOR */}
      {activeTab === 'trade' && (
        <div className="space-y-6">
          <h3 className="font-bebas text-3xl text-white tracking-wider">
            INTERACTIVE TRADE ROBBERY EVALUATOR
          </h3>

          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border-2 border-amber-500/30">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-extrabold text-red-400 uppercase tracking-wider flex items-center justify-between">
                  <span>YOU GIVE UP</span>
                  <span>-21.0 Pts Depth</span>
                </div>
                {demoTrade.give.map((p, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl flex items-center justify-between border border-slate-800">
                    <span className="font-bold text-xs text-white">{p.name} ({p.pos})</span>
                    <span className="text-xs text-slate-400">{p.projPts} pts/wk</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>YOU RECEIVE</span>
                  <span>+16.4 Alpha WR1</span>
                </div>
                {demoTrade.receive.map((p, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl flex items-center justify-between border border-slate-800">
                    <span className="font-bold text-xs text-white">{p.name} ({p.pos})</span>
                    <span className="text-xs text-slate-400">{p.projPts} pts/wk</span>
                  </div>
                ))}
              </div>

            </div>

            <div className="glass-panel-gold p-6 rounded-2xl space-y-3 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                {demoTrade.verdict}
              </div>

              <div className="flex items-center justify-center gap-8">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Current Win %</div>
                  <div className="font-bebas text-3xl text-slate-300">{demoTrade.winProbabilityBefore}%</div>
                </div>
                <div className="text-2xl text-amber-400 font-extrabold">➔</div>
                <div>
                  <div className="text-[10px] text-amber-400 uppercase font-bold">New Win %</div>
                  <div className="font-bebas text-4xl text-emerald-400">{demoTrade.winProbabilityAfter}%</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                {demoTrade.analysis}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: SUPERMACHO AI ASSISTANT CHAT */}
      {activeTab === 'chat' && (
        <div className="glass-panel rounded-3xl p-6 space-y-4 flex flex-col h-[550px] border-2 border-cyan-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-500">
                <img src="/supermacho_mascot.png" alt="SuperMacho" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bebas text-2xl text-white tracking-wider">SUPERMACHO AI CO-MANAGER</h3>
                <p className="text-[10px] text-emerald-400 font-bold">ALWAYS ONLINE • READY TO MAKE MONEY</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">GPT-4o Engine</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {aiChatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'supermacho' && (
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none' 
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <p>{msg.text}</p>
                  <div className={`text-[9px] mt-1 text-right font-medium ${msg.sender === 'user' ? 'text-slate-900' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-3 pt-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask SuperMacho: 'Who should I start at FLEX?' or 'Should I trade Tee Higgins?'"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button type="submit" className="btn-gold px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2">
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* PARAMETER CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bebas text-2xl text-white tracking-wider">CONFIGURE FANTASY LEAGUE</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Platform</label>
                <select 
                  value={platform} 
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500"
                >
                  <option value="ESPN">ESPN Fantasy Football</option>
                  <option value="Sleeper">Sleeper League</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">League ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8492019"
                    value={leagueIdInput}
                    onChange={(e) => setLeagueIdInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Team ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 3"
                    value={teamIdInput}
                    onChange={(e) => setTeamIdInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {platform === 'ESPN' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>HOW TO FIND YOUR ESPN DATA IN 30 SECONDS</span>
                  </div>
                  
                  <div className="space-y-2 text-[11px] text-slate-300">
                    <div className="bg-slate-900 p-2.5 rounded-xl space-y-1">
                      <div className="font-bold text-amber-300">1. League ID & Team ID:</div>
                      <p className="text-slate-400 text-[10px]">Open your ESPN League home page in your browser. Look at the URL bar at the top:</p>
                      <code className="block bg-slate-950 p-1.5 rounded text-[10px] text-emerald-400 font-mono">
                        ...leagueId=<strong className="text-amber-400">8492019</strong>&teamId=<strong className="text-amber-400">3</strong>
                      </code>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl space-y-1">
                      <div className="font-bold text-amber-300">2. Private League Cookies (espn_s2 & SWID):</div>
                      <p className="text-slate-400 text-[10px]">On your ESPN league page, press <strong className="text-white">F12</strong> ➔ Click <strong className="text-white">Application</strong> tab (or Storage) ➔ Click <strong className="text-white">Cookies</strong> ➔ Select <strong className="text-white">espn.com</strong> ➔ Copy <strong className="text-emerald-400">espn_s2</strong> and <strong className="text-emerald-400">SWID</strong>.</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">espn_s2 cookie</label>
                      <input
                        type="password"
                        placeholder="AE...[Paste espn_s2 string]"
                        value={espnS2Input}
                        onChange={(e) => setEspnS2Input(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SWID cookie</label>
                      <input
                        type="password"
                        placeholder="{SWID-...}"
                        value={swidInput}
                        onChange={(e) => setSwidInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full btn-gold py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider">
                Save & Sync Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STRIPE SECURE CHECKOUT MODAL */}
      <CheckoutModal 
        isOpen={showCheckoutModal} 
        onClose={() => setShowCheckoutModal(false)} 
        selectedPlan={checkoutPlan} 
        onPaymentSuccess={handleUpgradePlan} 
      />

    </div>
  );
};
