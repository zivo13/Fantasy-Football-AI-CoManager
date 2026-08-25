import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Check, X, Shield, Zap, Target, Flame, Scale, DollarSign } from 'lucide-react';

export const CreditPurchaseModal = ({ isOpen, onClose, targetFeature, requiredCredits }) => {
  const { userCredits, buyCredits, formatPrice, lang, featureCreditCosts = {} } = useApp();
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectPack = (amount, packName) => {
    buyCredits(amount, packName);
    setPurchaseSuccessMsg(`🎉 Successfully added +${amount} Credits! Your new balance is ${userCredits + amount} Credits.`);
    setTimeout(() => {
      setPurchaseSuccessMsg('');
      onClose();
    }, 1800);
  };

  const currencyLabel = lang === 'es' ? 'Pesos Mexicanos (MXN)' : lang === 'pt' ? 'Reais Brasileiros (BRL)' : 'US Dollars (USD)';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 text-center pt-2">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SUPERMACHO AI CREDIT STORE</span>
          </div>
          <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider">
            {requiredCredits ? `OUT OF CREDITS FOR THIS FEATURE!` : `BUY SUPERMACHO AI CREDITS`}
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            {requiredCredits 
              ? `You need ${requiredCredits} Credits to execute ${targetFeature || 'this action'}. Top up your balance below!`
              : `Purchase credit packs to run AI Lineup checks, secret Waiver snipes, Trade evaluations & Draft War Room!`}
          </p>
        </div>

        {/* Current Balance & Currency Badge */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xl">
              🪙
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Balance</div>
              <div className="font-bebas text-2xl text-amber-400 leading-none">{userCredits} Credits</div>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-400 font-semibold">
            <div>All Billing Strictly In:</div>
            <div className="text-amber-300 font-bold">US Dollars ($ USD)</div>
          </div>
        </div>

        {purchaseSuccessMsg && (
          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 p-4 rounded-2xl text-xs font-bold text-center animate-fade-in">
            {purchaseSuccessMsg}
          </div>
        )}

        {/* 3 Credit Packs Grid */}
        <div className="space-y-3">
          
          {/* Pack 1: Pay-As-You-Go Top Up */}
          <div 
            onClick={() => handleSelectPack(50, '50 Credits Quick Booster')}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">50 Credits Quick Booster</span>
                <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">PAY-AS-YOU-GO</span>
              </div>
              <div className="text-xs text-slate-400">Good for 50 Lineup Checks or 10 Draft War Room rounds</div>
            </div>
            <button className="btn-outline px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap group-hover:border-amber-500 group-hover:text-amber-400">
              {formatPrice(5.99)}
            </button>
          </div>

          {/* Pack 2: Pro Champion (Popular) */}
          <div 
            onClick={() => handleSelectPack(100, '100 Credits Pro Champion Pack')}
            className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-2 border-amber-500 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between relative shadow-lg shadow-amber-500/10 group"
          >
            <span className="absolute -top-3 left-4 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase">
              MOST POPULAR VALUE
            </span>
            <div className="space-y-0.5 pt-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-amber-300">100 Credits Pro Champion Pack</span>
              </div>
              <div className="text-xs text-slate-300">Power user pack for full Sunday lineup & waiver dominance</div>
            </div>
            <button className="btn-gold px-4 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap shadow-md">
              {formatPrice(9.99)}
            </button>
          </div>

          {/* Pack 3: Commissioner Mega Pack (Best Value) */}
          <div 
            onClick={() => handleSelectPack(300, '300 Credits Commissioner Mega Pack')}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">300 Credits Commissioner Mega Pack</span>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold px-2 py-0.5 rounded">BEST VALUE</span>
              </div>
              <div className="text-xs text-slate-400">Unlimited season-long AI Co-Manager power</div>
            </div>
            <button className="btn-outline px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap group-hover:border-cyan-500 group-hover:text-cyan-300">
              {formatPrice(24.99)}
            </button>
          </div>

        </div>

        {/* Feature Action Credit Costs Guide */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">CREDIT ACTION MENU</div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Start/Sit Card: <strong>{featureCreditCosts.lineupCheck ?? 1} Credit</strong></div>
            <div className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-400" /> Waiver Snipe: <strong>{featureCreditCosts.waiverSnipe ?? 2} Credits</strong></div>
            <div className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-cyan-400" /> Trade Evaluator: <strong>{featureCreditCosts.tradeEvaluator ?? 3} Credits</strong></div>
            <div className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-amber-400" /> Draft War Room: <strong>{featureCreditCosts.draftWarRoom ?? 5} Credits</strong></div>
          </div>
        </div>

      </div>
    </div>
  );
};
