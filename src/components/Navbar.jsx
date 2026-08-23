import React from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Shield, Zap, User, LogOut, Lock, LayoutDashboard, Sparkles, DollarSign } from 'lucide-react';

export const Navbar = () => {
  const { currentTab, setCurrentTab, user, setShowAuthModal, setAuthMode, handleLogout, lang, setLang, t } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      {/* Top Motto Ticker Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-bold py-1 overflow-hidden shadow-inner">
        <div className="animate-marquee whitespace-nowrap text-xs uppercase tracking-widest flex items-center gap-8 font-bebas">
          <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {t.motto}</span>
          <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4" /> SUPERMACHO AI CO-MANAGER IS ONLINE</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> REAL-TIME LINEUP OPTIMIZER & WAIVER TARGETS</span>
          <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {t.motto}</span>
          <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4" /> SUPERMACHO AI CO-MANAGER IS ONLINE</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Mascot */}
          <div 
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform bg-slate-900 flex items-center justify-center p-0.5 flex-shrink-0">
              <img 
                src="/supermacho_mascot.png" 
                alt="SuperMacho Mascot" 
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 items-center justify-center font-bebas text-2xl text-slate-950">
                SM
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bebas text-xl sm:text-2xl tracking-wider text-hero-gradient">SUPERMACHO</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold tracking-widest bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-2 py-0.5 rounded-full">LEADER OF THE PACK</span>
              </div>
              <p className="hidden sm:block text-[11px] text-amber-400 font-semibold tracking-wider uppercase">
                <span>{t.mottoShort}</span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('landing')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                currentTab === 'landing' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setCurrentTab('client')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                currentTab === 'client' 
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Client Dashboard</span>
              <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded">PRO</span>
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  currentTab === 'admin' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' 
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
                }`}
              >
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Admin Module</span>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">ADMIN</span>
              </button>
            )}
          </nav>

          {/* Right Action & Profile */}
          <div className="flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇲🇽 ES</option>
              <option value="pt">🇧🇷 PT</option>
            </select>
            {user.isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold text-slate-200">{user.name}</div>
                  <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                    {user.role === 'admin' ? 'SYSTEM ADMIN' : 'PRO CHAMPION PLAN'}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-cyan-500 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <User className="w-5 h-5 text-amber-400" />
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors border border-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-amber-400 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                  className="btn-gold px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Join</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
