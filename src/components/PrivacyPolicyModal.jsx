import React from 'react';
import { ShieldCheck, Lock, CheckCircle, X } from 'lucide-react';

export const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider">
              PRIVACY POLICY & DATA COMPLIANCE
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              SuperMacho.app Data Protection, GDPR, CCPA & Security Safeguards
            </p>
          </div>
        </div>

        {/* Policy Body Content */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-1">
            <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>100% Data Protection Guarantee</span>
            </div>
            <p className="text-slate-300">
              SuperMacho never sells, rents, or shares your personal information or fantasy league data with third-party advertisers. All credentials and cookies are encrypted using 256-Bit SSL & AES-256 bank-level encryption.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bebas text-lg text-white tracking-wide">1. Information We Collect</h4>
            <p>
              To provide personalized AI fantasy co-management, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Account Info: Email address, encrypted password, preferred language.</li>
              <li>Culture Profile Data: Birthday, favorite jersey/lucky number, and favorite NFL team.</li>
              <li>Fantasy League Parameters: ESPN or Sleeper public League ID and private cookie tokens (<code className="text-emerald-400">espn_s2</code> / <code className="text-emerald-400">SWID</code>) used strictly to read your roster projections.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bebas text-lg text-white tracking-wide">2. How We Use Your Data</h4>
            <p>
              Your data is exclusively used to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Generate real-time Start/Sit optimal lineup recommendations and waiver FAB bids.</li>
              <li>Send culture rewards, birthday congratulations, and championship milestone badges.</li>
              <li>Process billing subscriptions securely via Stripe.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bebas text-lg text-white tracking-wide">3. GDPR & CCPA Rights</h4>
            <p>
              Under California (CCPA) and European (GDPR) data privacy laws, you have the right to request a full copy of your data or request instant permanent account deletion at any time by contacting <strong className="text-amber-400">support@supermacho.app</strong>.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-3">
            <h4 className="font-bebas text-lg text-white tracking-wide">4. ESPN & Sleeper Compliance Statement</h4>
            <p className="text-slate-400">
              SuperMacho.app is an independent AI fantasy co-manager application and is not affiliated with, endorsed by, or sponsored by ESPN Inc. or Sleeper LLC. All trademark names are used solely for identification purposes.
            </p>
          </div>

        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full btn-gold py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
};
