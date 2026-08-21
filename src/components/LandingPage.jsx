import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Zap, ShieldCheck, Sparkles, Check, ArrowRight, DollarSign, Activity, Flame, Bot, Calculator, Clock, Users, Award, ShieldAlert } from 'lucide-react';

export const LandingPage = () => {
  const { plans, setCurrentTab, setShowAuthModal, setAuthMode, handleLogin } = useApp();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'seasonal'
  const [selectedPlanMsg, setSelectedPlanMsg] = useState(null);

  // Interactive ROI Calculator State
  const [buyIn, setBuyIn] = useState(100); // $100 league buy in
  const [numLeagues, setNumLeagues] = useState(2); // 2 leagues

  const projectedPayout = buyIn * 6 * numLeagues; // 1st place payout estimate
  const estimatedRoi = Math.round(projectedPayout * 0.85);

  const handleSelectPlan = (plan) => {
    if (plan.priceMonthly === 0) {
      handleLogin('demo@supermacho.ai', 'client');
      return;
    }
    setSelectedPlanMsg(`🚀 Stripe Checkout triggered for [${plan.name}]!`);
    setTimeout(() => {
      handleLogin('champ@supermacho.ai', 'client');
    }, 1200);
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

          {/* Centered Mascot Emblem Feature - BIGGER MR CAGE */}
          <div className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80 lg:w-[380px] lg:h-[380px] group cursor-pointer" onClick={() => setCurrentTab('client')}>
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-amber-500 via-amber-400 to-cyan-500 blur-2xl opacity-80 group-hover:opacity-100 transition-opacity animate-pulse-glow"></div>
            <div className="relative w-full h-full rounded-[36px] overflow-hidden border-4 border-amber-500 shadow-2xl shadow-amber-500/30 bg-slate-950 p-1.5">
              <img src="/supermacho_mascot.png" alt="SuperMacho Gridiron Hero" className="w-full h-full object-cover rounded-[28px] transform group-hover:scale-105 transition-transform" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bebas text-lg tracking-wider px-6 py-1 rounded-full shadow-2xl font-extrabold border-2 border-slate-950 uppercase">
              GRIDIRON HERO
            </div>
          </div>

          {/* Main Sales Funnel Slogan - SMALLER PROPORTIONAL TEXT */}
          <div className="space-y-3 max-w-3xl mx-auto pt-2">
            <h1 className="font-bebas text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight text-white">
              STOP LOSING YOUR LEAGUE MONEY. <br />
              <span className="text-hero-gradient">LET'S MAKE MONEY! 🏈💰</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto">
              SuperMacho is your high-octane AI Fantasy Co-Manager. Sync your ESPN & Sleeper rosters in 1-click for optimal lineups, secret waiver snipes, and trade robbery.
            </p>
          </div>

          {/* Centered Primary CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              className="w-full btn-gold py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 shadow-xl shadow-amber-500/25 group"
            >
              <Sparkles className="w-5 h-5" />
              <span>CLAIM FREE HERO ACCESS</span>
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
              <span>Calculate My Winnings</span>
            </button>
          </div>

          {/* Live Winners Ticker Bar */}
          <div className="pt-6 border-t border-slate-800/80 max-w-2xl mx-auto flex items-center justify-center gap-6 text-xs text-slate-400 font-bold">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Average User Win Rate: <strong className="text-white">78.4%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Prizes Won: <strong className="text-white">$142,500+</strong></span>
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
              HOW MUCH MONEY WILL YOU WIN THIS SEASON?
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto">
              Drag the sliders below to calculate your projected 1st place championship payout with SuperMacho AI Co-Manager optimizing your roster!
            </p>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
            
            {/* Slider 1: Buy-In */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 uppercase">League Buy-In Amount</span>
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
                <span>$25 Casual</span>
                <span>$250 High Stakes</span>
                <span>$1,000 Baller</span>
              </div>
            </div>

            {/* Slider 2: Number of Leagues */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 uppercase">Number of Fantasy Leagues</span>
                <span className="text-amber-400 font-bebas text-2xl">{numLeagues} {numLeagues === 1 ? 'League' : 'Leagues'}</span>
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
                <span>1 League</span>
                <span>5 Leagues</span>
                <span>10 Leagues</span>
              </div>
            </div>

          </div>

          {/* Result Payout Box */}
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 p-6 rounded-2xl border border-amber-500/40 text-center space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-300">Projected Season Championship Payout</div>
            <div className="font-bebas text-5xl sm:text-6xl text-hero-gradient">${estimatedRoi.toLocaleString()} ROI</div>
            <p className="text-xs text-slate-300 font-medium">
              Investing <strong className="text-amber-400">$4.99/mo</strong> in SuperMacho Pro gives you a projected <strong className="text-emerald-400">+42% Championship Win Probability</strong>.
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              className="btn-gold px-10 py-4 rounded-2xl text-base font-extrabold uppercase tracking-wider"
            >
              Start Winning Your ${estimatedRoi.toLocaleString()} Payout Now
            </button>
          </div>

        </div>
      </section>

      {/* FUNNEL STAGE 3: THE 4-STEP UNFAIR ADVANTAGE SYSTEM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 text-amber-400 font-extrabold text-xs uppercase tracking-widest border border-amber-500/30">
            <Zap className="w-4 h-4" />
            <span>THE UNFAIR ADVANTAGE SYSTEM</span>
          </div>
          <h2 className="font-bebas text-5xl text-white tracking-wider">
            HOW SUPERMACHO CRUSHES YOUR OPPONENTS
          </h2>
          <p className="text-slate-400 text-base">
            Everything you need to outsmart your league mates, grab waiver gems first, and take home the money trophy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="glass-panel p-6 rounded-3xl space-y-4 relative border-t-4 border-amber-500">
            <div className="font-bebas text-4xl text-amber-500/40">01</div>
            <h3 className="font-bebas text-2xl text-white tracking-wider">Instant Roster Sync</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Connect your ESPN & Sleeper leagues securely in seconds. SuperMacho imports your entire lineup and scoring settings automatically.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4 relative border-t-4 border-amber-400">
            <div className="font-bebas text-4xl text-amber-400/40">02</div>
            <h3 className="font-bebas text-2xl text-white tracking-wider">Start/Sit Heatmaps</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Calculates defense matchups, target shares, and ceiling variance to squeeze +18.4 extra points out of your roster every Sunday.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4 relative border-t-4 border-cyan-400">
            <div className="font-bebas text-4xl text-cyan-400/40">03</div>
            <h3 className="font-bebas text-2xl text-white tracking-wider">Secret Waiver Snipes</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Identifies breakout RB/WR waiver targets before your league mates notice, with exact recommended FAB dollar bids.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4 relative border-t-4 border-emerald-400">
            <div className="font-bebas text-4xl text-emerald-400/40">04</div>
            <h3 className="font-bebas text-2xl text-white tracking-wider">Trade Robbery AI</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Simulates trade proposals to evaluate roster impact and win-probability boosts before making offers to rivals.
            </p>
          </div>

        </div>
      </section>

      {/* FUNNEL STAGE 4: HIGH-CONVERTING PRICING TABLE */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="font-bebas text-5xl text-white tracking-wider">
            CHOOSE YOUR CHAMPION PLAN
          </h2>
          <p className="text-slate-400 text-base">
            Select your plan below to unlock full AI Co-Manager features. 100% Risk-Free Money Back Guarantee.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('seasonal')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'seasonal' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Season Pass</span>
              <span className="bg-slate-950 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-extrabold">SAVE 35%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const priceDisplay = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceSeasonal;
            const cycleText = billingCycle === 'monthly' ? '/month' : '/season pass';

            return (
              <div 
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular 
                    ? 'glass-panel-gold border-amber-500/50 shadow-2xl shadow-amber-500/20 md:-translate-y-2' 
                    : 'glass-panel hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">{plan.badge}</div>
                    <h3 className="font-bebas text-3xl text-white tracking-wider">{plan.name}</h3>
                    <p className="text-slate-400 text-xs mt-2 min-h-[36px]">{plan.description}</p>
                  </div>

                  <div className="py-2 border-y border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bebas text-5xl text-white">{plan.currency}{priceDisplay}</span>
                      <span className="text-slate-400 text-xs font-medium">{cycleText}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`mt-8 w-full py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                    plan.popular ? 'btn-gold' : 'btn-outline hover:border-amber-500/50'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
