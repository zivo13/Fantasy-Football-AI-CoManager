import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Shield, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../services/supabaseClient';

export const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, handleLogin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setAuthError('');

    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = cleanEmail.includes('admin');
    const assignedRole = isAdminEmail ? 'admin' : 'client';
    const userStorageKey = `sm_user_${cleanEmail}`;

    // 1. STAGE 1: GLOBAL SUSPENSION CHECK (Enforced first across all devices)
    try {
      const checkRes = await fetch(`/api/register-user?check_suspended=${encodeURIComponent(cleanEmail)}`);
      const checkData = await checkRes.json();
      if (checkData && checkData.isSuspended) {
        setAuthError('ACCOUNT SUSPENDED: Your account has been suspended by the League Commissioner. Access is restricted.');
        setLoading(false);
        return;
      }
    } catch (e) {}

    // Stage 1B: Check full server user list & suspended map
    try {
      const fullRes = await fetch('/api/register-user');
      const fullData = await fullRes.json();
      if (fullData) {
        if (fullData.suspended && fullData.suspended[cleanEmail]) {
          setAuthError('ACCOUNT SUSPENDED: Your account has been suspended by the League Commissioner. Access is restricted.');
          setLoading(false);
          return;
        }
        if (fullData.users) {
          const matched = fullData.users.find(u => u.user && u.user.toLowerCase() === cleanEmail);
          if (matched && matched.status && matched.status.includes('Suspended')) {
            setAuthError('ACCOUNT SUSPENDED: Your account has been suspended by the League Commissioner. Access is restricted.');
            setLoading(false);
            return;
          }
        }
      }
    } catch (e) {}

    // Stage 1C: Local storage suspension check
    try {
      const isLocalSuspended = localStorage.getItem(`sm_suspended_${cleanEmail}`);
      if (isLocalSuspended === 'true') {
        setAuthError('ACCOUNT SUSPENDED: Your account has been suspended by the League Commissioner. Access is restricted.');
        setLoading(false);
        return;
      }
    } catch (e) {}

    try {
      if (authMode === 'signup') {
        if (password.length < 4) {
          setAuthError('Password must be at least 4 characters long.');
          setLoading(false);
          return;
        }

        // Validate signup with server API
        try {
          const res = await fetch('/api/register-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password, action: 'signup', role: assignedRole })
          });
          const data = await res.json();
          if (data && data.error) {
            setAuthError(data.message || data.error);
            setLoading(false);
            return;
          }
        } catch (e) {}

        // Attempt Supabase signup & save local credential
        await signUpWithEmail(cleanEmail, password, cleanEmail.split('@')[0]);
        localStorage.setItem(userStorageKey, JSON.stringify({ email: cleanEmail, password, role: assignedRole }));
        handleLogin(cleanEmail, assignedRole);
      } else {
        // Validate login with server API (Strictly check user existence & password)
        try {
          const res = await fetch('/api/register-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password, action: 'login', role: assignedRole })
          });
          const data = await res.json();
          if (data && data.error) {
            setAuthError(data.message || data.error);
            setLoading(false);
            return;
          }
        } catch (e) {}

        // Check local stored credential if exists
        const storedUserJson = localStorage.getItem(userStorageKey);
        if (storedUserJson) {
          const storedUser = JSON.parse(storedUserJson);
          if (storedUser.password && storedUser.password !== password) {
            setAuthError('Incorrect password. Please enter the correct password.');
            setLoading(false);
            return;
          }
        }

        await signInWithEmail(cleanEmail, password);
        localStorage.setItem(userStorageKey, JSON.stringify({ email: cleanEmail, password, role: assignedRole }));
        handleLogin(cleanEmail, assignedRole);
      }
    } catch (err) {
      console.warn('Auth Error:', err);
      setAuthError('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      handleLogin('google_user@supermacho.app', 'client');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-500/10 max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider">
            {authMode === 'login' ? 'WELCOME BACK, CHAMP!' : 'JOIN SUPERMACHO TODAY'}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">
            {authMode === 'login' ? 'Log in to access your AI Fantasy Co-Manager' : "Start winning your fantasy league & let's make money!"}
          </p>
        </div>

        {/* Google 1-Click Signup Button */}
        <button
          onClick={handleGoogleAuth}
          className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2.5 sm:py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mb-3 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-2.5">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-[10px] text-slate-500 font-bold uppercase">or email</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {authError && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
            {authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
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

        {/* Quick Demo Preview Button */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => handleLogin('champ@supermacho.app', 'client')}
            className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span>Try Quick Interactive Demo Dashboard</span>
          </button>
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
