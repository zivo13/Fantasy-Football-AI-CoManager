import React from 'react';
import { Trophy, Shield, DollarSign, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 pt-12 pb-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bebas text-xl text-slate-950 font-bold">
                SM
              </div>
              <span className="font-bebas text-2xl text-white tracking-wider">SUPERMACHO GRIDIRON HERO</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              The ultimate AI Co-Manager built to help fantasy football managers dominate their ESPN and Sleeper leagues. High-yield waiver pickups, matchup heatmaps, trade evaluation, and game-day recommendations.
            </p>
            <div className="text-xs text-amber-400 font-bold tracking-wider uppercase flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>LET'S MAKE MONEY! • DOMINATE YOUR FANTASY LEAGUE</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bebas text-lg text-white tracking-wider mb-3">Platform Modules</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Start/Sit Lineup Optimizer</a></li>
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Waiver Wire Dominator</a></li>
              <li><a href="#features" className="hover:text-amber-400 transition-colors">AI Trade Evaluator</a></li>
              <li><a href="#pricing" className="hover:text-amber-400 transition-colors">Subscription Plans</a></li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div>
            <h4 className="font-bebas text-lg text-white tracking-wider mb-3">Trust & Security</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><span className="text-emerald-400 font-medium flex items-center gap-1.5"><Shield className="w-4 h-4" /> Encrypted Cookie Auth</span></li>
              <li><span>AES-256 Roster Protection</span></li>
              <li><span>Stripe Secure Billing</span></li>
              <li><span>24/7 AI Server Uptime</span></li>
            </ul>
          </div>

        </div>

        {/* Legal Disclaimer & Trademark Notice */}
        <div className="pt-8 border-t border-slate-900 text-xs text-slate-500 space-y-3">
          <p className="leading-relaxed">
            <strong className="text-slate-400">DISCLAIMER:</strong> SuperMacho is an independent fantasy football AI decision-support platform. SuperMacho is not affiliated with, endorsed by, or sponsored by the National Football League (NFL), ESPN, Yahoo, or Sleeper. All NFL team names, player names, logos, and trademarks mentioned on this website belong strictly to their respective trademark holders.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600">
            <div>© {new Date().getFullYear()} SuperMacho Hero Inc. All rights reserved.</div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>Crafted for Fantasy Football Champions</span>
              <Trophy className="w-3.5 h-3.5 text-amber-500 ml-1" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
