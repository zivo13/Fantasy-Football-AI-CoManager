import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Shield, User, Lock, Mail, ArrowRight } from 'lucide-react';

export const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, handleLogin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    handleLogin(email, 'client');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10">
        
        {/* Close button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bebas text-3xl text-white tracking-wider">
            {authMode === 'login' ? 'WELCOME BACK, CHAMP!' : 'JOIN SUPERMACHO TODAY'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {authMode === 'login' ? 'Log in to access your AI Fantasy Co-Manager' : "Start winning your fantasy league & let's make money!"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="champ@supermacho.ai"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-gold py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2"
          >
            <span>{authMode === 'login' ? 'Sign In & Win' : 'Create SuperMacho Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            ⚡ Quick Demo Login Presets
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleLogin('champ@supermacho.app', 'client')}
              className="px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Login as Client</span>
            </button>

            <button
              onClick={() => handleLogin('admin@supermacho.app', 'admin')}
              className="px-3 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Login as Admin</span>
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="text-center mt-4 text-xs text-slate-400">
          {authMode === 'login' ? (
            <span>Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-amber-400 font-bold hover:underline">Sign up now</button></span>
          ) : (
            <span>Already have an account? <button onClick={() => setAuthMode('login')} className="text-amber-400 font-bold hover:underline">Sign in</button></span>
          )}
        </div>

      </div>
    </div>
  );
};
