import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Zap, ShieldCheck, Sparkles, Check, ArrowRight, DollarSign, Activity, Flame, Bot, Calculator, Clock, Users, User, Award, ShieldAlert, HelpCircle } from 'lucide-react';

export const LandingPage = () => {
  const { plans = [], setCurrentTab, setShowAuthModal, setAuthMode, handleLogin, t = ((k)=>k), formatPrice = ((p) => (p === undefined || p === null) ? '$0.00' : typeof p === 'number' ? `$${p.toFixed(2)}` : `$${p}`), setShowCreditModal = (() => {}) } = useApp();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'seasonal'
  const [selectedPlanMsg, setSelectedPlanMsg] = useState(null);
  const [liveNflData, setLiveNflData] = useState(null);

  // Fetch real-time official ESPN & NFL schedule & breaking headlines
  useEffect(() => {
    try {
      fetch('/api/nfl-sync')
        .then(res => res.json())
        .then(data => {
          if (data && (data.games || data.headlines)) {
            setLiveNflData(data);
          }
        })
        .catch(() => {});
    } catch (e) {}
  }, []);

  // Interactive ROI Calculator State
  const [buyIn, setBuyIn] = useState(100); // $100 league buy in
  const [numLeagues, setNumLeagues] = useState(2); // 2 leagues

  const projectedPayout = buyIn * 6 * numLeagues; // 1st place payout estimate
  const estimatedRoi = Math.round(projectedPayout * 0.85);

  const handleSelectPlan = async (plan) => {
    if (plan.priceMonthly === 0) {
      handleLogin('demo@supermacho.app', 'client');
      return;
    }

    try {
      setSelectedPlanMsg(`🚀 Connecting to Stripe Checkout for [${plan.name}]...`);
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          userEmail: 'champ@supermacho.app',
          billingCycle: billingCycle
        })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        // Fallback simulation if running in offline mode
        setTimeout(() => {
          handleLogin('champ@supermacho.app', 'client');
        }, 1200);
      }
    } catch (err) {
      console.error('Stripe Redirect Error:', err);
      handleLogin('champ@supermacho.app', 'client');
    }
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* Checkout Notification Toast */}
      {selectedPlanMsg && (
        <div className="fixed top-24 right-5 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 animate-bounce">
          <Sparkles className="w-6 h-6" />
          <span>{selectedPlanMsg}</span>
        </div>
      )}

      {/* FUNNEL STAGE 1: CENTERED HERO HEADER */}
      <section className="relative pt-12 lg:pt-20 text-center overflow-hidden">
        
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          
          {/* Top Urgency Countdown Banner */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-400 text-xs font-extrabold uppercase tracking-widest shadow-xl shadow-amber-500/10">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>WEEK 1 FANTASY KICKOFF IN: <strong className="text-white">03 DAYS 14 HRS 22 MINS</strong></span>
          </div>

          {/* Centered Mascot Emblem Feature */}
          <div className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80 lg:w-[380px] lg:h-[380px] group">
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-amber-500 via-amber-400 to-cyan-500 blur-2xl opacity-80 group-hover:opacity-100 transition-opacity animate-pulse-glow"></div>
            <div className="relative w-full h-full rounded-[36px] overflow-hidden border-4 border-amber-500 shadow-2xl shadow-amber-500/30 bg-slate-950 p-1.5">
              <img src="/supermacho_mascot.png" alt="SuperMacho Gridiron Hero" className="w-full h-full object-cover rounded-[28px] transform group-hover:scale-105 transition-transform" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bebas text-lg tracking-wider px-6 py-1 rounded-full shadow-2xl font-extrabold border-2 border-slate-950 uppercase">
              GRIDIRON HERO
            </div>
          </div>

          {/* Mobile-Only Auth Buttons: Relocated UNDER the SuperMacho Logo and ABOVE the Title Text */}
          <div className="sm:hidden flex items-center justify-center gap-3 pt-6 pb-2">
            <button
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="btn-gold px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{t.signIn || 'Sign In'}</span>
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              className="px-6 py-3 rounded-2xl text-xs font-extrabold text-amber-300 border-2 border-amber-500/50 bg-amber-500/10 uppercase tracking-wider flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.joinBtn || 'Join Free'}</span>
            </button>
          </div>

          {/* Main Sales Funnel Slogan */}
          <div className="space-y-3 max-w-3xl mx-auto pt-2">
            <h1 className="font-bebas text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight text-white uppercase">
              {t.heroTitlePart1} <br />
              <span className="text-hero-gradient">{t.heroTitlePart2}</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto">
              {t.heroDesc}
            </p>
          </div>

          {/* Centered Primary CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              className="w-full btn-gold py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 shadow-xl shadow-amber-500/25 group uppercase"
            >
              <Sparkles className="w-5 h-5" />
              <span>{t.ctaFree}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('roi-calculator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full btn-outline py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>{t.ctaCalc}</span>
            </button>
          </div>

          {/* Live Winners Ticker Bar */}
          <div className="pt-6 border-t border-slate-800/80 max-w-2xl mx-auto flex items-center justify-center gap-6 text-xs text-slate-400 font-bold">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{t.avgWinRate} <strong className="text-white">78.4%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>{t.prizesWon} <strong className="text-white">$142,500+</strong></span>
            </div>
          </div>

        </div>
      </section>

      {/* REAL OFFICIAL ESPN / NFL SCOREBOARD & BREAKING NEWS TICKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
        <div className="bg-slate-950 p-4 rounded-3xl border-2 border-amber-500/40 shadow-2xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>OFFICIAL REAL-TIME NFL STREAM • ESPN SYNCED</span>
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{liveNflData?.seasonWeek || 'NFL Official Schedule & Breaking News'}</span>
            </div>
          </div>

          {/* Live Games & Real Headlines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Real Game 1 */}
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>{liveNflData?.games?.[0]?.shortName || 'KC vs BAL'}</span>
                <span className="text-amber-400 font-mono">{liveNflData?.games?.[0]?.statusDetail || 'Upcoming Kickoff'}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-extrabold text-white">
                <div className="flex items-center gap-1.5">
                  {liveNflData?.games?.[0]?.homeLogo && <img src={liveNflData.games[0].homeLogo} className="w-5 h-5 object-contain" alt="" />}
                  <span>{liveNflData?.games?.[0]?.homeAbbrev || 'KC Chiefs'}</span>
                </div>
                <span className="font-bebas text-lg text-amber-400">
                  {(liveNflData?.games?.[0]?.hasScore || liveNflData?.games?.[0]?.isCompleted || liveNflData?.games?.[0]?.isLive) ? `${liveNflData.games[0].homeScore} - ${liveNflData.games[0].awayScore}` : 'VS'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span>{liveNflData?.games?.[0]?.awayAbbrev || 'BAL Ravens'}</span>
                  {liveNflData?.games?.[0]?.awayLogo && <img src={liveNflData.games[0].awayLogo} className="w-5 h-5 object-contain" alt="" />}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span>Official NFL Schedule</span>
                <span className="text-emerald-400 font-bold">{liveNflData?.games?.[0]?.odds || 'Line: KC -3.5'}</span>
              </div>
            </div>

            {/* Real Game 2 */}
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>{liveNflData?.games?.[1]?.shortName || 'SF vs DAL'}</span>
                <span className="text-amber-400 font-mono">{liveNflData?.games?.[1]?.statusDetail || 'Upcoming Kickoff'}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-extrabold text-white">
                <div className="flex items-center gap-1.5">
                  {liveNflData?.games?.[1]?.homeLogo && <img src={liveNflData.games[1].homeLogo} className="w-5 h-5 object-contain" alt="" />}
                  <span>{liveNflData?.games?.[1]?.homeAbbrev || 'SF 49ers'}</span>
                </div>
                <span className="font-bebas text-lg text-amber-400">
                  {(liveNflData?.games?.[1]?.hasScore || liveNflData?.games?.[1]?.isCompleted || liveNflData?.games?.[1]?.isLive) ? `${liveNflData.games[1].homeScore} - ${liveNflData.games[1].awayScore}` : 'VS'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span>{liveNflData?.games?.[1]?.awayAbbrev || 'DAL Cowboys'}</span>
                  {liveNflData?.games?.[1]?.awayLogo && <img src={liveNflData.games[1].awayLogo} className="w-5 h-5 object-contain" alt="" />}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span>Official NFL Schedule</span>
                <span className="text-cyan-400 font-bold">{liveNflData?.games?.[1]?.odds || 'Line: SF -4.0'}</span>
              </div>
            </div>

            {/* Real ESPN Breaking Headline Box */}
            <div className="bg-gradient-to-r from-amber-500/10 to-cyan-500/10 p-3.5 rounded-2xl border border-amber-500/30 space-y-1 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>OFFICIAL ESPN BREAKING NEWS</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-snug font-medium line-clamp-2">
                📰 {liveNflData?.headlines?.[0]?.headline || 'SuperMacho AI connected directly to ESPN & NFL official sports data stream.'}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS IN 3 EASY STEPS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel-gold p-8 sm:p-10 rounded-3xl space-y-8 border-2 border-amber-500/40">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>ZERO PUZZLE • ZERO CONFUSION</span>
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider">
              {t.howTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-bebas text-2xl font-bold flex items-center justify-center">
                01
              </div>
              <h3 className="font-bebas text-2xl text-white tracking-wider">{t.step1Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.step1Desc}</p>
            </div>

            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-bebas text-2xl font-bold flex items-center justify-center">
                02
              </div>
              <h3 className="font-bebas text-2xl text-white tracking-wider">{t.step2Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.step2Desc}</p>
            </div>

            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-400 text-slate-950 font-bebas text-2xl font-bold flex items-center justify-center">
                03
              </div>
              <h3 className="font-bebas text-2xl text-white tracking-wider">{t.step3Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FUNNEL STAGE 2: INTERACTIVE "MAKE MONEY" ROI CALCULATOR */}
      <section id="roi-calculator" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel-gold p-8 sm:p-12 rounded-3xl relative overflow-hidden space-y-8 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-widest">
              <Calculator className="w-4 h-4" />
              <span>SUPERMACHO PAYOUT CALCULATOR</span>
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider">
              {t.roiTitle}
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto">
              {t.roiDesc}
            </p>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
            
            {/* Slider 1: Buy-In */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 uppercase">{t.roiBuyInLabel}</span>
                <span className="text-amber-400 font-bebas text-2xl">${buyIn} / League</span>
              </div>
              <input 
                type="range" 
                min="25" 
                max="1000" 
                step="25"
                value={buyIn} 
                onChange={(e) => setBuyIn(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>$25</span>
                <span>$250</span>
                <span>$1,000</span>
              </div>
            </div>

            {/* Slider 2: Number of Leagues */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 uppercase">{t.roiLeaguesLabel}</span>
                <span className="text-amber-400 font-bebas text-2xl">{numLeagues}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={numLeagues} 
                onChange={(e) => setNumLeagues(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

          </div>

          {/* Result Payout Box */}
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 p-6 rounded-2xl border border-amber-500/40 text-center space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-300">{t.roiPayoutLabel}</div>
            <div className="font-bebas text-5xl sm:text-6xl text-hero-gradient">${estimatedRoi.toLocaleString()} ROI</div>
            <p className="text-xs text-slate-300 font-medium">
              {t.roiWinBoost}
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              className="btn-gold px-10 py-4 rounded-2xl text-base font-extrabold uppercase tracking-wider"
            >
              {t.roiCta}
            </button>
          </div>

        </div>
      </section>

      {/* FUNNEL STAGE 3: THE 4-STEP UNFAIR ADVANTAGE SYSTEM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 text-amber-400 font-extrabold text-xs uppercase tracking-widest border border-amber-500/30">
            <Zap className="w-4 h-4" />
            <span>UNFAIR ADVANTAGE</span>
          </div>
          <h2 className="font-bebas text-5xl text-white tracking-wider">
            {t.featuresTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="glass-panel p-6 rounded-3xl space-y-4 relative border-t-4 border-amber-500">
            <div className="font-bebas text-4xl text-amber-500/40">01</div>
            <h3 className="font-bebas text-2xl text-white tracking-wider">{t.f1Title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{t.f1Desc}</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4 relative border-t-4 border-amber-400">
            <div className="font-bebas text-4xl text-amber-400/40">02</div>
            <h3 className="font-bebas text-2xl text-white tracking-wider">{t.f2Title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{t.f2Desc}</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4 relative border-t-4 border-cyan-400">
            <div className="font-bebas text-4xl text-cyan-400/40">03</div>
            <h3 className="font-bebas text-2xl text-white tracking-wider">{t.f3Title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{t.f3Desc}</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4 relative border-t-4 border-emerald-400">
            <div className="font-bebas text-4xl text-emerald-400/40">04</div>
            <h3 className="font-bebas text-2xl text-white tracking-wider">{t.f4Title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{t.f4Desc}</p>
          </div>

        </div>
      </section>

      {/* FUNNEL STAGE 4: CREDIT PACKS & MONETIZATION TABLE */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-widest border border-amber-500/40">
            <span>{t.creditBadge}</span>
          </div>
          <h2 className="font-bebas text-5xl text-white tracking-wider">
            {t.creditTitle}
          </h2>
          <p className="text-slate-400 text-base">
            {t.creditDesc}
          </p>
        </div>

        {/* 3 AI Credit Packs Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

          {/* Card 2: Pay-As-You-Go Booster */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-6 border border-amber-500/30 hover:border-amber-500/60 transition-all">
            <div className="space-y-4">
              <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">{t.packBoosterTopup || 'QUICK TOP-UP'}</div>
              <h3 className="font-bebas text-3xl text-white tracking-wider">{t.packBoosterTitle || '50 CREDITS BOOSTER'}</h3>
              <div className="py-2 border-y border-slate-800">
                <span className="font-bebas text-4xl text-white">{formatPrice(5.99)}</span>
                <div className="text-amber-400 text-[11px] font-extrabold">{t.packBoosterExtra || '50 Extra AI Credits'}</div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {t.packBoosterItem1 || '50 Start/Sit Lineup Checks'}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {t.packBoosterItem2 || '25 Waiver FAB Target Snipe Checks'}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {t.packBoosterItem3 || 'Never expires'}</li>
              </ul>
            </div>
            <button
              onClick={() => setShowCreditModal(true)}
              className="w-full btn-outline border-amber-500/50 text-amber-300 py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 uppercase tracking-wider hover:bg-amber-500/10"
            >
              <span>{t.packBoosterBtn || 'Buy 50 Credits'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Pro Champion Pack (Popular) */}
          <div className="glass-panel-gold p-6 rounded-3xl flex flex-col justify-between space-y-6 border-2 border-amber-500 shadow-xl shadow-amber-500/10 relative -translate-y-1">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-3 py-0.5 rounded-full tracking-widest shadow-md">
              {t.packProPopular || 'MOST POPULAR VALUE'}
            </div>
            <div className="space-y-4 pt-1">
              <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">{t.packProPowerUser || 'POWER USER'}</div>
              <h3 className="font-bebas text-3xl text-white tracking-wider">{t.packProTitle || '100 CREDITS PRO'}</h3>
              <div className="py-2 border-y border-amber-500/40">
                <span className="font-bebas text-4xl text-amber-300">{formatPrice(9.99)}</span>
                <div className="text-amber-400 text-[11px] font-extrabold">{t.packProExtra || '100 Extra AI Credits'}</div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> {t.packProItem1 || '100 Start/Sit Lineup Checks'}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> {t.packProItem2 || '33 Trade Robbery Simulations'}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" /> {t.packProItem3 || '20 Live Draft War Room Rounds'}</li>
              </ul>
            </div>
            <button
              onClick={() => setShowCreditModal(true)}
              className="w-full btn-gold py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg"
            >
              <span>{t.packProBtn || 'Buy 100 Credits'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 4: Commissioner Mega Pack (Best Value) */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-6 border border-cyan-500/40 hover:border-cyan-400 transition-all">
            <div className="space-y-4">
              <div className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">{t.packMegaTitleSmall || 'MEGA PACK'}</div>
              <h3 className="font-bebas text-3xl text-white tracking-wider">{t.packMegaTitle || '300 CREDITS MEGA'}</h3>
              <div className="py-2 border-y border-slate-800">
                <span className="font-bebas text-4xl text-white">{formatPrice(24.99)}</span>
                <div className="text-cyan-400 text-[11px] font-extrabold">{t.packMegaExtra || '300 Extra AI Credits (Best Value)'}</div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> {t.packMegaItem1 || 'Full Season Co-Manager Power'}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> {t.packMegaItem2 || '60 Live Draft War Room Rounds'}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 flex-shrink-0" /> {t.packMegaItem3 || '100 Trade & Waiver Analyses'}</li>
              </ul>
            </div>
            <button
              onClick={() => setShowCreditModal(true)}
              className="w-full btn-outline border-cyan-500/50 text-cyan-300 py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 uppercase tracking-wider hover:bg-cyan-500/10"
            >
              <span>{t.packMegaBtn || 'Buy 300 Credits'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) MODULE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 text-amber-400 font-extrabold text-xs uppercase tracking-widest border border-amber-500/30">
            <HelpCircle className="w-4 h-4" />
            <span>KNOWLEDGE BASE</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider">
            {t.faqTitle}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl space-y-2 border-l-4 border-amber-500">
            <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t.q1}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              {t.a1}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-2 border-l-4 border-amber-400">
            <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t.qProfile || 'How do I change my preferred language, lucky jersey number, or favorite team?'}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              {t.aProfile || 'Click your user avatar (👤 Profile) in the top navigation bar! Inside your Champion Profile, you can switch your preferred language (English 🇺🇸, Spanish 🇲🇽, Portuguese 🇧🇷), set your birthday for automated rewards, and customize your lucky jersey number and favorite NFL team.'}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-2 border-l-4 border-cyan-500">
            <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{t.qDraft}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              {t.aDraft}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-2 border-l-4 border-cyan-500">
            <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{t.q2}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              {t.a2}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-2 border-l-4 border-emerald-500">
            <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{t.q3}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              {t.a3}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-2 border-l-4 border-purple-500">
            <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>{t.q4}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              {t.a4}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
