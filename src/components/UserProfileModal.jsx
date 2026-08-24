import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Calendar, Hash, Shield, Check, X, Sparkles, Trophy } from 'lucide-react';

const NFL_TEAMS = [
  'Kansas City Chiefs',
  'Dallas Cowboys',
  'San Francisco 49ers',
  'Philadelphia Eagles',
  'Pittsburgh Steelers',
  'Green Bay Packers',
  'New England Patriots',
  'Las Vegas Raiders',
  'Miami Dolphins',
  'Buffalo Bills',
  'Baltimore Ravens',
  'Cincinnati Bengals',
  'Detroit Lions',
  'Houston Texans',
  'Seattle Seahawks',
  'Minnesota Vikings',
  'Chicago Bears',
  'New York Jets',
  'New York Giants',
  'Atlanta Falcons',
  'New Orleans Saints',
  'Los Angeles Chargers',
  'Denver Broncos',
  'Los Angeles Rams',
  'Jacksonville Jaguars',
  'Indianapolis Colts',
  'Tennessee Titans',
  'Arizona Cardinals',
  'Carolina Panthers',
  'Washington Commanders',
  'Cleveland Browns',
  'Tampa Bay Buccaneers'
];

export const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser, lang, setLang, t } = useApp();

  const [birthday, setBirthday] = useState('');
  const [favoriteNumber, setFavoriteNumber] = useState('77');
  const [favoriteTeam, setFavoriteTeam] = useState('Kansas City Chiefs');
  const [prefLang, setPrefLang] = useState(lang || 'en');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load profile when modal opens
  useEffect(() => {
    if (user?.email && isOpen) {
      const clean = user.email.toLowerCase();

      const populate = (p) => {
        if (!p) return;
        if (p.birthday) setBirthday(p.birthday);
        if (p.favoriteNumber) setFavoriteNumber(p.favoriteNumber);
        if (p.favoriteTeam) setFavoriteTeam(p.favoriteTeam);
        if (p.prefLang) {
          setPrefLang(p.prefLang);
          setLang(p.prefLang);
        }
      };

      // 1. Try React user context profile
      if (user.profile) {
        populate(user.profile);
      }

      // 2. Try localStorage credential store
      let hasLocalProfile = false;
      try {
        const savedProfile = localStorage.getItem(`sm_profile_${clean}`);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          populate(parsed);
          hasLocalProfile = true;
        }
      } catch (e) {}

      // 3. Fetch server profile to hydrate server state
      try {
        fetch(`/api/register-user?get_profile=${encodeURIComponent(clean)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.profile && !hasLocalProfile) {
              populate(data.profile);
              try {
                localStorage.setItem(`sm_profile_${clean}`, JSON.stringify(data.profile));
              } catch (e) {}
            }
          })
          .catch(() => {});
      } catch (e) {}
    }
  }, [user?.email, isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const cleanEmail = (user?.email || '').toLowerCase();

    const profileData = {
      email: cleanEmail,
      birthday,
      favoriteNumber,
      favoriteTeam,
      prefLang,
      profileCompleted: true
    };

    // Save profile locally
    try {
      localStorage.setItem(`sm_profile_${cleanEmail}`, JSON.stringify(profileData));
      
      const userKey = `sm_user_${cleanEmail}`;
      const savedUserJson = localStorage.getItem(userKey);
      if (savedUserJson) {
        const savedUser = JSON.parse(savedUserJson);
        savedUser.profile = profileData;
        localStorage.setItem(userKey, JSON.stringify(savedUser));
      }
    } catch (e) {}

    // Update global user context state
    if (typeof setUser === 'function') {
      setUser(prev => ({
        ...prev,
        profile: profileData
      }));
    }

    // Update global app language state
    setLang(prefLang);

    // Send profile data to server
    try {
      fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          profile: profileData
        })
      });
    } catch (e) {}

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 max-h-[92vh] overflow-y-auto space-y-5">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider">
            {t.profTitle || 'MY CHAMPION CULTURE PROFILE'}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {t.profSub || 'Customize your SuperMacho credentials, rewards & birthday alerts'}
          </p>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>
            <h4 className="font-bebas text-2xl text-white tracking-wider">{t.profSavedTitle || 'PROFILE SAVED!'}</h4>
            <p className="text-xs text-slate-300">
              {t.profSavedSub || 'Your Champion preferences have been updated!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            {/* Registered Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                {t.profEmailLabel || 'Account Email'}
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'champ@supermacho.app'}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-bold opacity-80 cursor-not-allowed"
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                {t.profLangLabel || 'Preferred Language'}
              </label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 cursor-pointer font-bold"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇲🇽 Español</option>
                <option value="pt">🇧🇷 Português</option>
              </select>
            </div>

            {/* Birthday Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.profBdayLabel || 'Birthday (For Rewards & Congrats)'}</span>
              </label>
              <input
                type="date"
                required
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500"
              />
            </div>

            {/* Favorite Number & Favorite Team Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-amber-400" />
                  <span>{t.profLuckyLabel || 'Lucky #'}</span>
                </label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="#77"
                  value={favoriteNumber}
                  onChange={(e) => setFavoriteNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono text-center font-bold focus:border-amber-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.profTeamLabel || 'Favorite NFL Team'}</span>
                </label>
                <select
                  value={favoriteTeam}
                  onChange={(e) => setFavoriteTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 font-medium cursor-pointer"
                >
                  {NFL_TEAMS.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full btn-gold py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.profSaveBtn || 'Save Champion Profile'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
