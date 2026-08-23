import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Shield, Zap, User, LogOut, Lock, LayoutDashboard, Sparkles, DollarSign, KeyRound, ShieldCheck } from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { UserProfileModal } from './UserProfileModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

export const Navbar = () => {
  const { currentTab, setCurrentTab, user, setShowAuthModal, setAuthMode, handleLogout, lang, setLang, t } = useApp();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand Logo & Mascot Badge */}
          <div 
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform bg-slate-900 p-0.5">
              <img src="/supermacho_mascot.png" alt="SuperMacho Mascot" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bebas text-2xl sm:text-3xl text-white tracking-wider group-hover:text-amber-400 transition-colors uppercase">
                  SUPERMACHO
                </span>
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded uppercase">
                  AI CO-MANAGER
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-widest hidden sm:block">
                LEAD THE PACK • WIN THE MONEY
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('landing')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                currentTab === 'landing' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t.navOverview || 'Overview'}
            </button>

            <button
              onClick={() => {
                if (user.isLoggedIn) {
                  setCurrentTab('client');
                } else {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }
              }}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                currentTab === 'client' 
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>{t.navClient || 'Client Dashboard'}</span>
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
                <span>{t.navAdmin || 'Admin'}</span>
              </button>
            )}
          </nav>

          {/* Right Action & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs rounded-xl px-2 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇲🇽 ES</option>
              <option value="pt">🇧🇷 PT</option>
            </select>

            {user.isLoggedIn ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div 
                  onClick={() => setShowProfileModal(true)}
                  className="hidden sm:block text-right cursor-pointer group"
                  title="View Champion Profile"
                >
                  <div className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors flex items-center justify-end gap-1">
                    <span>{user.name}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                    {user.role === 'admin' 
                      ? 'SYSTEM ADMIN' 
                      : (user.plan || (user.planId === 'free' ? 'FREE ROOKIE PLAN' : user.planId === 'commissioner' ? 'COMMISSIONER PLAN' : 'PRO CHAMPION PLAN')).toUpperCase()
                    }
                  </div>
                </div>

                <button
                  onClick={() => setShowProfileModal(true)}
                  title="My Champion Profile"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-cyan-500 p-0.5 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  </div>
                </button>

                <button
                  onClick={() => setShowPasswordModal(true)}
                  title="Change Password"
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition-colors border border-slate-800 flex items-center gap-1"
                >
                  <KeyRound className="w-4 h-4" />
                  <span className="hidden md:inline text-xs font-bold">Password</span>
                </button>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors border border-slate-800"
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
                  {t.signIn || 'Sign In'}
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                  className="btn-gold px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{t.joinBtn || 'Join'}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>

    {/* CHAMPION PROFILE MODAL */}
    <UserProfileModal 
      isOpen={showProfileModal} 
      onClose={() => setShowProfileModal(false)} 
    />

    {/* CHANGE PASSWORD MODAL */}
    <ChangePasswordModal 
      isOpen={showPasswordModal} 
      onClose={() => setShowPasswordModal(false)} 
    />

    {/* PRIVACY POLICY MODAL */}
    <PrivacyPolicyModal 
      isOpen={showPrivacyModal} 
      onClose={() => setShowPrivacyModal(false)} 
    />
  </>
);
};
