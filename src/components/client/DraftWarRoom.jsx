import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Zap, Target, Users, Flame, ShieldAlert, Sparkles, TrendingUp, ChevronRight, Scale, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';

export const DraftWarRoom = () => {
  const appState = useApp() || {};
  const currentLeague = appState.currentLeague || (appState.leagues && appState.leagues[0]) || { scoring: 'PPR' };
  const tRaw = appState.t;
  const t = typeof tRaw === 'function' ? tRaw : (key => (tRaw && tRaw[key]) || key);
  
  // State for active AI Coach Question
  const [activeQuestion, setActiveQuestion] = useState('target_pos');
  const [filterPos, setFilterPos] = useState('ALL');
  const [liveDraftPool, setLiveDraftPool] = useState(null);
  const [showGlossary, setShowGlossary] = useState(false);

  // Available Players Board with Real Rankings & Tier Drops
  const defaultAvailablePlayers = [
    { id: 'p1', name: 'Ja\'Marr Chase', pos: 'WR', team: 'CIN', adp: '1.01', projPts: 318.5, floor: 17.5, ceiling: 35.0, upsideTier: 'WR1 OVERALL', valueSteal: 'CONSENSUS #1 PICK', needMatch: false },
    { id: 'p2', name: 'Bijan Robinson', pos: 'RB', team: 'ATL', adp: '1.02', projPts: 298.2, floor: 15.8, ceiling: 30.1, upsideTier: 'RB1 OVERALL', valueSteal: 'TOP RB ANCHOR', needMatch: true },
    { id: 'p3', name: 'Saquon Barkley', pos: 'RB', team: 'PHI', adp: '1.03', projPts: 292.0, floor: 15.2, ceiling: 29.5, upsideTier: 'S-TIER VOLUME', valueSteal: 'TOP 3 PICK', needMatch: true },
    { id: 'p4', name: 'Breece Hall', pos: 'RB', team: 'NYJ', adp: '1.04', projPts: 286.4, floor: 14.8, ceiling: 28.2, upsideTier: 'S-TIER ELITE', valueSteal: '+2 Picks Value', needMatch: true },
    { id: 'p5', name: 'Justin Jefferson', pos: 'WR', team: 'MIN', adp: '1.05', projPts: 290.1, floor: 15.5, ceiling: 31.2, upsideTier: 'ELITE TARGET SHARE', valueSteal: 'TOP 5 WR', needMatch: false },
    { id: 'p6', name: 'CeeDee Lamb', pos: 'WR', team: 'DAL', adp: '1.06', projPts: 288.5, floor: 15.0, ceiling: 30.5, upsideTier: 'ELITE TARGET SHARE', valueSteal: 'TOP 6 WR', needMatch: false },
    { id: 'p7', name: 'Amon-Ra St. Brown', pos: 'WR', team: 'DET', adp: '1.07', projPts: 275.2, floor: 14.5, ceiling: 27.8, upsideTier: 'HIGH FLOOR ANCHOR', valueSteal: 'ROUND 1 ANCHOR', needMatch: false },
    { id: 'p8', name: 'Malik Nabers', pos: 'WR', team: 'NYG', adp: '1.08', projPts: 264.5, floor: 13.2, ceiling: 28.0, upsideTier: 'BREAKOUT SUPERSTAR', valueSteal: '+4 Picks Value', needMatch: false },
    { id: 'p9', name: 'Derrick Henry', pos: 'RB', team: 'BAL', adp: '1.09', projPts: 272.0, floor: 14.0, ceiling: 29.0, upsideTier: 'TOUCHDOWN MONSTER', valueSteal: '+3 Picks Value', needMatch: true },
    { id: 'p10', name: 'Jahmyr Gibbs', pos: 'RB', team: 'DET', adp: '1.10', projPts: 265.8, floor: 13.5, ceiling: 28.4, upsideTier: 'DYNAMIC EXPLOSIVE', valueSteal: '+2 Picks Value', needMatch: true },
    { id: 'p11', name: 'Nico Collins', pos: 'WR', team: 'HOU', adp: '1.11', projPts: 258.4, floor: 12.8, ceiling: 27.5, upsideTier: 'ALPHA WR1', valueSteal: 'ROUND 1 VALUE', needMatch: false },
    { id: 'p12', name: 'Puka Nacua', pos: 'WR', team: 'LAR', adp: '1.12', projPts: 255.0, floor: 12.5, ceiling: 26.8, upsideTier: 'TARGET MONSTER', valueSteal: 'ROUND 1 VALUE', needMatch: false },
    { id: 'p13', name: 'Garrett Wilson', pos: 'WR', team: 'NYJ', adp: '2.01', projPts: 248.0, floor: 12.0, ceiling: 26.0, upsideTier: 'ALPHA TARGET SHARE', valueSteal: '+3 Picks Value', needMatch: false },
    { id: 'p14', name: 'Brian Thomas Jr.', pos: 'WR', team: 'JAX', adp: '2.02', projPts: 242.5, floor: 11.8, ceiling: 26.5, upsideTier: 'BREAKOUT SPEEDSTAR', valueSteal: '+5 Picks Value', needMatch: false },
    { id: 'p15', name: 'Marvin Harrison Jr.', pos: 'WR', team: 'ARI', adp: '2.03', projPts: 238.9, floor: 11.2, ceiling: 25.4, upsideTier: 'BREAKOUT UPSIDE', valueSteal: '+4 Picks Value', needMatch: false },
    { id: 'p16', name: 'Josh Allen', pos: 'QB', team: 'BUF', adp: '2.04', projPts: 365.2, floor: 19.5, ceiling: 35.0, upsideTier: 'QB1 OVERALL', valueSteal: 'QB1 ANCHOR', needMatch: false },
    { id: 'p17', name: 'Lamar Jackson', pos: 'QB', team: 'BAL', adp: '2.05', projPts: 358.0, floor: 19.0, ceiling: 34.0, upsideTier: 'KONAMI CODE QB', valueSteal: 'QB2 ANCHOR', needMatch: false },
    { id: 'p18', name: 'Jonathan Taylor', pos: 'RB', team: 'IND', adp: '2.06', projPts: 245.0, floor: 12.2, ceiling: 26.0, upsideTier: 'WORKHORSE RB', valueSteal: '+4 Picks Value', needMatch: true },
    { id: 'p19', name: 'De\'Von Achane', pos: 'RB', team: 'MIA', adp: '2.07', projPts: 240.2, floor: 11.5, ceiling: 29.8, upsideTier: 'HOME RUN CEILING', valueSteal: '+5 Picks Value', needMatch: true },
    { id: 'p20', name: 'Kyren Williams', pos: 'RB', team: 'LAR', adp: '2.08', projPts: 236.5, floor: 11.8, ceiling: 24.5, upsideTier: 'REDZONE TOUCHES', valueSteal: '+3 Picks Value', needMatch: true },
    { id: 'p21', name: 'Josh Jacobs', pos: 'GB', team: 'GB', adp: '2.09', projPts: 230.1, floor: 11.0, ceiling: 24.0, upsideTier: 'WORKHORSE RB', valueSteal: '+4 Picks Value', needMatch: true },
    { id: 'p22', name: 'Kenneth Walker III', pos: 'RB', team: 'SEA', adp: '2.10', projPts: 225.4, floor: 10.8, ceiling: 23.5, upsideTier: 'TOUCHDOWN CEILING', valueSteal: '+5 Picks Value', needMatch: true },
    { id: 'p23', name: 'James Cook', pos: 'RB', team: 'BUF', adp: '2.11', projPts: 220.0, floor: 10.5, ceiling: 22.8, upsideTier: 'PASS CATCHER RB', valueSteal: '+6 Picks Value', needMatch: true },
    { id: 'p24', name: 'Chuba Hubbard', pos: 'RB', team: 'CAR', adp: '3.02', projPts: 210.5, floor: 10.0, ceiling: 21.5, upsideTier: 'HIGH VOLUME RB', valueSteal: 'ROUND 3 VALUE', needMatch: true },
    { id: 'p25', name: 'Chase Brown', pos: 'RB', team: 'CIN', adp: '3.05', projPts: 205.2, floor: 9.8, ceiling: 22.0, upsideTier: 'BREAKOUT RB', valueSteal: 'ROUND 3 STEAL', needMatch: true },
    { id: 'p26', name: 'Brock Bowers', pos: 'TE', team: 'LV', adp: '3.08', projPts: 215.4, floor: 10.5, ceiling: 23.0, upsideTier: 'TE1 OVERALL', valueSteal: 'TE1 ANCHOR', needMatch: false },
    { id: 'p27', name: 'Trey McBride', pos: 'TE', team: 'ARI', adp: '3.10', projPts: 208.2, floor: 10.0, ceiling: 21.8, upsideTier: 'ELITE TARGET SHARE', valueSteal: '+6 Picks Value', needMatch: false },
    { id: 'p28', name: 'Patrick Mahomes', pos: 'QB', team: 'KC', adp: '3.12', projPts: 332.0, floor: 17.5, ceiling: 30.0, upsideTier: 'PASSING YARD QB', valueSteal: 'ROUND 3 VALUE', needMatch: false },
    { id: 'p29', name: 'Jayden Daniels', pos: 'QB', team: 'WAS', adp: '4.02', projPts: 328.5, floor: 16.8, ceiling: 31.5, upsideTier: 'RUSHING UPSIDE GEM', valueSteal: '+8 Picks Value', needMatch: false },
    { id: 'p30', name: 'Christian McCaffrey', pos: 'RB', team: 'SF', adp: '4.04', projPts: 198.5, floor: 8.5, ceiling: 24.0, upsideTier: 'VETERAN RECOVERY', valueSteal: 'PICK #40 OVERALL', needMatch: true }
  ];

  useEffect(() => {
    try {
      fetch('/api/nfl-sync')
        .then(res => res.json())
        .then(data => {
          if (data && data.draftPlayers && Array.isArray(data.draftPlayers)) {
            setLiveDraftPool(data.draftPlayers);
          }
        })
        .catch(() => {});
    } catch (e) {}
  }, []);

  const availablePlayers = liveDraftPool || defaultAvailablePlayers;

  // AI Advice Preset Mapping for the 5 User Questions
  const AI_ADVICE_MAP = {
    target_pos: {
      title: "🎯 TARGET RECOMMENDATION: RB2 (RUNNING BACK)",
      alert: "⚠️ TIER DROP WARNING: Only 2 S-Tier RBs remain before a massive 35-point projection cliff!",
      analysis: "You already anchored WR1 with CeeDee Lamb in Round 1. Your team urgent priority is securing RB2 before Round 3 ends. Target Breece Hall or Bijan Robinson now to balance your floor.",
      action: "Pick RB next in Round 2"
    },
    best_rb: {
      title: "🏃 BEST AVAILABLE RBs & TIER DROP RADAR",
      alert: "🔥 TOP TARGET: Breece Hall (NYJ - 268.4 Proj Pts, 82% Snap Share)",
      analysis: "1. Breece Hall (RB - NYJ) — 88% Redzone Touch Share, +4 Picks Value\n2. Bijan Robinson (RB - ATL) — 78% Target Share, S-Tier Floor\n3. Kenneth Walker III (RB - SEA) — Round 4 Value Steal (+5 Picks Value)",
      action: "Draft Breece Hall"
    },
    team_compare: {
      title: "📊 LEAGUE TEAM COMPARISON & RANKINGS",
      alert: "🏆 YOUR TEAM RANKING: #2 OUT OF 12 LEAGUE TEAMS (84.2/100 GRADE)",
      analysis: "Your roster leads the league in Projected Weekly Floor (114.2 Pts). You have a +24.8 Pts advantage in WR target share over League Rival 'Gridiron Kings'. Securing an elite RB2 will move you to #1 overall.",
      action: "Maintain High-Floor Strategy"
    },
    upside: {
      title: "⚡ PLAYER UPSIDE COMPARISON (Breece Hall vs. Bijan Robinson)",
      alert: "🔥 HIGHER CEILING: Breece Hall (+1.4 Pts Ceiling Advantage)",
      analysis: "Breece Hall has a 26.5 Pts single-game ceiling due to receiving volume in NYJ offense. Bijan Robinson has higher floor stability (13.8 Pts floor). AI Recommendation: Draft Breece Hall for championship tournament upside.",
      action: "Breece Hall has +4% Higher Win Probability"
    },
    roster_needs: {
      title: "⚠️ URGENT ROSTER NEEDS ANALYSIS",
      alert: "🚨 BIGGEST GAP: RB2 (CRITICAL NEED) & TE1 (SECONDARY NEED)",
      analysis: "Filled Starters: QB1 (Lamar Jackson), WR1 (CeeDee Lamb), WR2 (Brandon Aiyuk).\nMissing Gaps: RB2 position is currently EMPTY. If you skip RB now, your projected RB2 starting points drop by -4.8 Pts/week.",
      action: "Address RB2 Immediately"
    }
  };

  const currentAdvice = AI_ADVICE_MAP[activeQuestion];

  const filteredPlayers = filterPos === 'ALL' 
    ? availablePlayers 
    : availablePlayers.filter(p => p.pos === filterPos);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER & DRAFT STATUS BAR */}
      <div className="glass-panel-gold p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-0.5 rounded-full uppercase">
              LIVE DRAFT EXPERT ASSISTANT
            </span>
            <span className="text-xs text-amber-400 font-bold">• SCORING: {currentLeague?.scoring || 'PPR'}</span>
          </div>
          <h1 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider">
            {t('draftWarRoomTitle')}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">
            Real-time roster access, tier-drop alerts, best available players, and league comparison engine.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Current On-Clock Pick</div>
            <div className="font-bebas text-2xl text-amber-400">ROUND 2 • PICK #14</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 5 ONE-CLICK AI COACH STRATEGIC QUESTIONS */}
      <div className="space-y-3">
        <div className="text-xs font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>ASK SUPERMACHO AI DRAFT COACH:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <button
            onClick={() => setActiveQuestion('target_pos')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              activeQuestion === 'target_pos'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <Target className="w-4 h-4 flex-shrink-0" />
              <span>{t('targetPosBtn')}</span>
            </div>
            <p className="text-[10px] opacity-80 font-medium">{t('targetPosDesc')}</p>
          </button>

          <button
            onClick={() => setActiveQuestion('best_rb')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              activeQuestion === 'best_rb'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <Flame className="w-4 h-4 flex-shrink-0" />
              <span>{t('bestRbBtn')}</span>
            </div>
            <p className="text-[10px] opacity-80 font-medium">{t('bestRbDesc')}</p>
          </button>

          <button
            onClick={() => setActiveQuestion('team_compare')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              activeQuestion === 'team_compare'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span>{t('teamCompareBtn')}</span>
            </div>
            <p className="text-[10px] opacity-80 font-medium">{t('teamCompareDesc')}</p>
          </button>

          <button
            onClick={() => setActiveQuestion('upside')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              activeQuestion === 'upside'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <Scale className="w-4 h-4 flex-shrink-0" />
              <span>{t('upsideBtn')}</span>
            </div>
            <p className="text-[10px] opacity-80 font-medium">{t('upsideDesc')}</p>
          </button>

          <button
            onClick={() => setActiveQuestion('roster_needs')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              activeQuestion === 'roster_needs'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{t('rosterNeedsBtn')}</span>
            </div>
            <p className="text-[10px] opacity-80 font-medium">{t('rosterNeedsDesc')}</p>
          </button>

        </div>
      </div>

      {/* DYNAMIC AI COACH RESPONSE CARD */}
      <div className="bg-slate-950 p-6 rounded-3xl border-2 border-amber-500/40 space-y-4 shadow-2xl shadow-amber-500/10 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h3 className="font-bebas text-2xl text-white tracking-wider">
              {currentAdvice.title}
            </h3>
          </div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold px-3 py-1 rounded-xl">
            {currentAdvice.action}
          </span>
        </div>

        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 font-bold">
          {currentAdvice.alert}
        </div>

        <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-line">
          {currentAdvice.analysis}
        </p>
      </div>

      {/* METRICS & GLOSSARY GUIDE EXPANDABLE ACCORDION */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div 
          onClick={() => setShowGlossary(!showGlossary)}
          className="flex items-center justify-between cursor-pointer text-xs font-extrabold text-amber-400 uppercase tracking-widest"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{t('glossaryTitle')}</span>
          </div>
          <span className="text-slate-400 text-xs">{showGlossary ? '▲' : '▼'}</span>
        </div>

        {showGlossary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-slate-300 border-t border-slate-800 animate-fade-in">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('adpTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('adpDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('projPtsTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('projPtsDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('floorCeilingTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('floorCeilingDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('valueStealTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('valueStealDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('draftTargetTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('draftTargetDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('heroRbTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('heroRbDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
              <strong className="text-amber-400 block font-bold">{t('konamiCodeTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('konamiCodeDesc')}</p>
            </div>
          </div>
        )}
      </div>

      {/* BEST AVAILABLE PLAYERS BOARD */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bebas text-2xl text-white tracking-wider">BEST AVAILABLE PLAYERS BOARD</h3>
            <p className="text-xs text-slate-400 font-medium">Ranked by SuperMacho AI Value Steal Rating & Projections</p>
          </div>

          {/* Position Filters */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {['ALL', 'RB', 'WR', 'QB', 'TE'].map(pos => (
              <button
                key={pos}
                onClick={() => setFilterPos(pos)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-colors ${
                  filterPos === pos ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Players List Table */}
        <div className="space-y-2.5">
          {filteredPlayers.map((player) => (
            <div 
              key={player.id}
              className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bebas text-lg font-bold ${
                  player.pos === 'RB' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  player.pos === 'WR' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                  player.pos === 'QB' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                }`}>
                  {player.pos}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>{player.name}</span>
                    <span className="text-[11px] text-slate-400">({player.team})</span>
                    {player.needMatch && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded">FIT NEED</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-3 mt-0.5">
                    <span>ADP: <strong className="text-slate-200">{player.adp}</strong></span>
                    <span>Proj Pts: <strong className="text-amber-400">{player.projPts}</strong></span>
                    <span>Floor/Ceiling: <strong className="text-slate-200">{player.floor} - {player.ceiling} Pts</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                  {player.valueSteal}
                </span>
                <button 
                  onClick={() => alert(`Draft Target Lock: ${player.name} added to your live draft queue!`)}
                  className="btn-gold px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-md uppercase whitespace-nowrap"
                >
                  <span>Draft Target</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-COLUMN GRID: ROSTER NEEDS RADAR & LEAGUE TEAM COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column A: Roster Needs Radar */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bebas text-2xl text-white tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>ROSTER NEEDS & STARTER GAPS</span>
            </h3>
            <span className="text-xs font-bold text-amber-400">3/7 Starters Filled</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">QB1: Lamar Jackson (BAL)</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase">FILLED (ELITE)</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">WR1: CeeDee Lamb (DAL)</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase">FILLED (ELITE)</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-bold text-amber-400">RB1: Urgent Priority Target Next</span>
              </div>
              <span className="text-[10px] font-extrabold text-slate-950 bg-amber-400 px-2 py-0.5 rounded uppercase">CRITICAL GAP</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-bold text-amber-400">RB2: Urgent Priority Target Next</span>
              </div>
              <span className="text-[10px] font-extrabold text-slate-950 bg-amber-400 px-2 py-0.5 rounded uppercase">CRITICAL GAP</span>
            </div>
          </div>
        </div>

        {/* Column B: League Team Comparison Matrix */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bebas text-2xl text-white tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>LEAGUE TEAM COMPARISON</span>
            </h3>
            <span className="text-xs font-bold text-cyan-400">12 Teams Scored</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">1. Gridiron Kings</div>
                <div className="text-[10px] text-slate-400">2 RBs, 1 WR Drafted</div>
              </div>
              <div className="text-right">
                <div className="font-bebas text-lg text-emerald-400">86.5 Grade</div>
                <div className="text-[10px] text-slate-400">118.2 Proj Pts</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 p-3 rounded-xl border-2 border-amber-500/50 flex justify-between items-center">
              <div>
                <div className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <span>2. YOUR TEAM (SUPERMACHO AI)</span>
                  <span className="bg-amber-500 text-slate-950 text-[9px] px-1.5 rounded font-black">YOU</span>
                </div>
                <div className="text-[10px] text-slate-300 font-medium">1 QB, 2 WRs Drafted</div>
              </div>
              <div className="text-right">
                <div className="font-bebas text-xl text-amber-400">84.2 Grade</div>
                <div className="text-[10px] font-bold text-emerald-400">114.2 Proj Pts</div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">3. Blitz Dynasty</div>
                <div className="text-[10px] text-slate-400">1 QB, 1 RB, 1 TE</div>
              </div>
              <div className="text-right">
                <div className="font-bebas text-lg text-slate-300">81.0 Grade</div>
                <div className="text-[10px] text-slate-400">109.5 Proj Pts</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
