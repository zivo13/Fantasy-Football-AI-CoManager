import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, Check, X, Sparkles } from 'lucide-react';

export const CheckoutModal = ({ isOpen, onClose, selectedPlan, onPaymentSuccess }) => {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const planName = selectedPlan?.name || 'Pro Champion';
  const planPrice = selectedPlan?.price || '$4.99/mo';
  const planAmount = selectedPlan?.amount || 4.99;

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    let formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 4);
    if (val.length >= 3) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setExpiry(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMsg('Please enter a valid 16-digit credit card number.');
      return;
    }

    if (!expiry || expiry.length < 5) {
      setErrorMsg('Please enter a valid expiration date (MM/YY).');
      return;
    }

    if (!cvc || cvc.length < 3) {
      setErrorMsg('Please enter a valid 3-digit CVC code.');
      return;
    }

    setIsProcessing(true);

    // Simulate Stripe payment authorization delay
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);

      setTimeout(() => {
        setPaymentDone(false);
        onPaymentSuccess(planName + ` (${planPrice})`, selectedPlan?.id || 'pro');
        onClose();
      }, 1500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider">
            STRIPE SECURE CHECKOUT
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Upgrade to <strong className="text-amber-400">{planName}</strong> for <strong className="text-emerald-400">{planPrice}</strong>
          </p>
        </div>

        {paymentDone ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-bebas text-2xl text-white tracking-wider">PAYMENT AUTHORIZED!</h4>
            <p className="text-xs text-slate-300">
              Receipt sent to your email. Your <strong className="text-amber-400">{planName}</strong> subscription is now active!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Order Summary Box */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{planName}</span>
                </div>
                <div className="text-[10px] text-slate-400">Monthly subscription • Cancel anytime</div>
              </div>
              <div className="font-bebas text-2xl text-emerald-400">{planPrice}</div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Credit Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white font-mono focus:border-amber-500"
                />
                <div className="absolute right-3 top-2.5 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                  VISA/MC
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Expires
                </label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono text-center focus:border-amber-500"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  CVC
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono text-center focus:border-amber-500"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="90210"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono text-center focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-800">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                256-Bit SSL Encrypted
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Stripe Payments
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full btn-gold py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Authorizing Card...</span>
              ) : (
                <span>Pay {planPrice} & Unlock {planName}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
