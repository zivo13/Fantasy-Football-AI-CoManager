import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, DollarSign, Users, TrendingUp, Plus, Edit2, Trash2, Check, X, Sparkles, Sliders, Cpu, Save } from 'lucide-react';

export const AdminDashboard = () => {
  const { plans, handleSavePlan, handleDeletePlan, adminMetrics } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState('plans'); // 'plans' | 'users' | 'revenue' | 'system'
  
  // Plan Editor Form state
  const [editingPlan, setEditingPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    id: '',
    name: '',
    badge: '',
    priceMonthly: 4.99,
    priceSeasonal: 29.99,
    currency: '$',
    description: '',
    featuresText: '',
    popular: false,
    maxLeagues: 3,
    tradeAnalyzer: true,
    gameDayAlerts: true
  });

  // System Parameter State
  const [selectedAiModel, setSelectedAiModel] = useState('GPT-4o');
  const [announcementTicker, setAnnouncementTicker] = useState("LET'S MAKE MONEY! - DOMINATE YOUR FANTASY LEAGUE");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const openNewPlanModal = () => {
    setPlanForm({
      id: 'plan_' + Date.now(),
      name: 'Custom Tier',
      badge: 'NEW TIER',
      priceMonthly: 7.99,
      priceSeasonal: 45.99,
      currency: '$',
      description: 'Custom plan configured via SuperMacho Admin.',
      featuresText: "Unlimited Leagues\nAI Trade Evaluator\nCustom Notifications",
      popular: false,
      maxLeagues: 5,
      tradeAnalyzer: true,
      gameDayAlerts: true
    });
    setEditingPlan(null);
    setShowPlanModal(true);
  };

  const openEditPlanModal = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      ...plan,
      featuresText: plan.features.join('\n')
    });
    setShowPlanModal(true);
  };

  const handlePlanFormSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...planForm,
      priceMonthly: parseFloat(planForm.priceMonthly),
      priceSeasonal: parseFloat(planForm.priceSeasonal),
      features: planForm.featuresText.split('\n').filter(f => f.trim() !== ''),
      ctaText: planForm.ctaText || 'Select Plan'
    };
    handleSavePlan(updated);
    setShowPlanModal(false);
  };

  const handleSaveSystemSettings = (e) => {
    e.preventDefault();
    setSaveSuccessMsg('System parameters successfully saved!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="glass-panel-cyan p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500 text-slate-950 font-extrabold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> SUPERMACHO ADMIN COMMAND CENTER
            </span>
            <span className="text-xs text-slate-400 font-bold">• FULL ACCESS MODE</span>
          </div>
          <h1 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider mt-1">
            SAAS MANAGEMENT & PLAN CONFIGURATOR
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Manage subscription plans, pricing tiers, system parameters, and financial performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Recurring Revenue</div>
            <div className="font-bebas text-2xl text-emerald-400">${adminMetrics.mrr.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('plans')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeAdminTab === 'plans' ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Plan Configurator</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeAdminTab === 'users' ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Subscribers & Users</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('revenue')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeAdminTab === 'revenue' ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Revenue Analytics</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('system')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeAdminTab === 'system' ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>System & AI Models</span>
        </button>
      </div>

      {/* TAB 1: PLAN CONFIGURATOR */}
      {activeAdminTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bebas text-2xl text-white tracking-wider">SUBSCRIPTION PLAN MANAGER</h3>
              <p className="text-xs text-slate-400">Configure prices, feature limits, badges, and Stripe price bindings.</p>
            </div>
            <button
              onClick={openNewPlanModal}
              className="btn-cyan px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Plan Tier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="glass-panel p-6 rounded-3xl space-y-4 relative flex flex-col justify-between">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                      {plan.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">Max Leagues: {plan.maxLeagues}</span>
                  </div>

                  <div>
                    <h4 className="font-bebas text-3xl text-white tracking-wider">{plan.name}</h4>
                    <p className="text-slate-400 text-xs mt-1">{plan.description}</p>
                  </div>

                  <div className="py-2 border-y border-slate-800 flex items-baseline gap-2">
                    <span className="font-bebas text-4xl text-amber-400">${plan.priceMonthly}/mo</span>
                    <span className="text-slate-400 text-xs font-semibold">(${plan.priceSeasonal}/season)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Included Features</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => openEditPlanModal(plan)}
                    className="flex-1 btn-outline py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:border-cyan-500"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Plan</span>
                  </button>

                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2.5 bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIBERS */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          <h3 className="font-bebas text-2xl text-white tracking-wider">ACTIVE SUBSCRIBERS & ROSTER ACCOUNTS</h3>
          
          <div className="glass-panel rounded-3xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Current Plan</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {adminMetrics.recentSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-bold text-white">{sub.user}</td>
                    <td className="p-4 text-amber-400 font-bold">{sub.plan}</td>
                    <td className="p-4 text-slate-400">{sub.date}</td>
                    <td className="p-4">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-cyan-400 font-bold hover:underline">Manage Tier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REVENUE ANALYTICS */}
      {activeAdminTab === 'revenue' && (
        <div className="space-y-6">
          <h3 className="font-bebas text-2xl text-white tracking-wider">REVENUE & PERFORMANCE METRICS</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-3xl space-y-2">
              <div className="text-xs text-slate-400 uppercase font-bold">Monthly Recurring (MRR)</div>
              <div className="font-bebas text-4xl text-amber-400">${adminMetrics.mrr.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-400 font-bold">▲ +24% vs last month</div>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-2">
              <div className="text-xs text-slate-400 uppercase font-bold">Annualized (ARR)</div>
              <div className="font-bebas text-4xl text-cyan-400">${adminMetrics.arr.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-400 font-bold">▲ +42% projected growth</div>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-2">
              <div className="text-xs text-slate-400 uppercase font-bold">Active Subscribers</div>
              <div className="font-bebas text-4xl text-white">{adminMetrics.activeSubscribers}</div>
              <div className="text-[10px] text-slate-400">Total Users: {adminMetrics.totalUsers}</div>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-2">
              <div className="text-xs text-slate-400 uppercase font-bold">Trial Conversion Rate</div>
              <div className="font-bebas text-4xl text-purple-400">{adminMetrics.conversionRate}</div>
              <div className="text-[10px] text-emerald-400 font-bold">Industry Leader 🔥</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM PARAMETERS */}
      {activeAdminTab === 'system' && (
        <form onSubmit={handleSaveSystemSettings} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <h3 className="font-bebas text-2xl text-white tracking-wider">SYSTEM & AI PARAMETERS</h3>

          {saveSuccessMsg && (
            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 p-4 rounded-xl text-xs font-bold">
              {saveSuccessMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Primary AI Engine Model</label>
              <select
                value={selectedAiModel}
                onChange={(e) => setSelectedAiModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-cyan-500"
              >
                <option value="GPT-4o">OpenAI GPT-4o (High Speed & Reasoning)</option>
                <option value="Claude-3.5-Sonnet">Anthropic Claude 3.5 Sonnet (Advanced Projections)</option>
                <option value="Gemini-1.5-Pro">Google Gemini 1.5 Pro (Free Tier Engine)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Global Live Announcement Ticker</label>
              <input
                type="text"
                value={announcementTicker}
                onChange={(e) => setAnnouncementTicker(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-cyan-500"
              />
            </div>
          </div>

          <button type="submit" className="btn-cyan px-6 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save System Parameters</span>
          </button>
        </form>
      )}

      {/* PLAN EDIT / CREATE MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bebas text-2xl text-white tracking-wider">
                {editingPlan ? 'EDIT SUBSCRIPTION PLAN' : 'CREATE NEW SUBSCRIPTION PLAN'}
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePlanFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={planForm.priceMonthly}
                    onChange={(e) => setPlanForm({...planForm, priceMonthly: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Seasonal Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={planForm.priceSeasonal}
                    onChange={(e) => setPlanForm({...planForm, priceSeasonal: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Badge Title</label>
                <input
                  type="text"
                  value={planForm.badge}
                  onChange={(e) => setPlanForm({...planForm, badge: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Features (One per line)</label>
                <textarea
                  rows={4}
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({...planForm, featuresText: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <button type="submit" className="w-full btn-cyan py-3 rounded-xl font-bold text-xs uppercase">
                Save Subscription Tier
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
