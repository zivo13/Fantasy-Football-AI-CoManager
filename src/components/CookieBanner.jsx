import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, Check } from 'lucide-react';

export const CookieBanner = ({ onOpenPrivacyModal }) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('sm_cookie_consent');
      if (!consent) {
        setShowBanner(true);
      }
    } catch (e) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('sm_cookie_consent', 'accepted');
    } catch (e) {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-xl z-[90] animate-slide-up">
      <div className="bg-slate-900/95 border-2 border-amber-500/50 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-2xl shadow-amber-500/10 space-y-3">
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bebas text-lg text-white tracking-wider">
                COOKIE & DATA PRIVACY COMPLIANCE
              </h4>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                GDPR • ePrivacy Directive • CCPA Compliant
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBanner(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          SuperMacho uses essential cookies and 256-Bit SSL encryption to store your session preferences, preferred language, and secure your fantasy roster data. We <strong>never</strong> sell or share your data with advertisers.
        </p>

        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <button
            onClick={onOpenPrivacyModal}
            className="text-[11px] font-bold text-slate-400 hover:text-amber-400 underline transition-colors"
          >
            Read Privacy Policy
          </button>

          <button
            onClick={handleAcceptAll}
            className="btn-gold px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg uppercase"
          >
            <Check className="w-4 h-4" />
            <span>Accept All Cookies</span>
          </button>
        </div>

      </div>
    </div>
  );
};
