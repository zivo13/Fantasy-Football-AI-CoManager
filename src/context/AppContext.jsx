import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PLANS, DEMO_ROSTER, DEMO_WAIVERS, DEMO_TRADE_SCENARIO, ADMIN_METRICS } from '../services/mockData';
import { TRANSLATIONS } from '../services/translations';
import { CreditPurchaseModal } from '../components/CreditPurchaseModal';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Language state: 'en' | 'es' | 'pt'
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('sm_lang') || 'es';
    } catch (e) {
      return 'es';
    }
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('sm_lang', newLang);
    } catch (e) {}
  };

  // User state (Default to Guest for new visitors)
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: 'guest', // 'guest' | 'client' | 'admin'
    planId: 'free',
    isLoggedIn: false
  });

  // Custom Admin Translations State
  const [customTranslations, setCustomTranslations] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_custom_translations');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const activeTranslations = customTranslations || TRANSLATIONS;
  const dict = (activeTranslations && activeTranslations[lang]) || (TRANSLATIONS[lang] || TRANSLATIONS.en);
  
  const t = (key) => {
    if (activeTranslations && activeTranslations[lang] && activeTranslations[lang][key]) {
      return activeTranslations[lang][key];
    }
    return dict[key] || (TRANSLATIONS.en && TRANSLATIONS.en[key]) || key;
  };
  Object.assign(t, dict);

  const updateCustomTranslations = (updatedObj) => {
    setCustomTranslations(updatedObj);
    try {
      localStorage.setItem('sm_custom_translations', JSON.stringify(updatedObj));
    } catch (e) {}
  };

  const resetCustomTranslations = () => {
    setCustomTranslations(null);
    try {
      localStorage.removeItem('sm_custom_translations');
    } catch (e) {}
  };

  // Price Formatter Helper (Always USD $)
  const formatPrice = (usdPrice) => {
    if (usdPrice === undefined || usdPrice === null) return '$0.00';
    const num = typeof usdPrice === 'number' ? usdPrice : parseFloat(usdPrice);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  // Configurable Feature Action Credit Costs State
  const DEFAULT_FEATURE_COSTS = {
    lineupCheck: 1,
    waiverSnipe: 2,
    tradeEvaluator: 3,
    draftWarRoom: 5,
    aiCoachChat: 1
  };

  const [featureCreditCosts, setFeatureCreditCosts] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_feature_credit_costs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_FEATURE_COSTS;
  });

  const updateFeatureCreditCosts = (newCostsObj) => {
    setFeatureCreditCosts(newCostsObj);
    try {
      localStorage.setItem('sm_feature_credit_costs', JSON.stringify(newCostsObj));
    } catch (e) {}
  };

  // Credits / Tokens System State
  const [userCredits, setUserCredits] = useState(() => {
    try {
      const stored = localStorage.getItem('sm_user_credits');
      if (stored !== null) return parseInt(stored, 10);
    } catch (e) {}
    return 20; // 20 Free Credits default
  });

  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditModalReq, setCreditModalReq] = useState({ requiredCredits: 0, targetFeature: '' });

  const deductCredits = (amount, featureName = 'this feature') => {
    if (userCredits >= amount) {
      const newBal = userCredits - amount;
      setUserCredits(newBal);
      try {
        localStorage.setItem('sm_user_credits', newBal.toString());
      } catch (e) {}
      if (user && user.email) {
        try {
          fetch('/api/register-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, credits: newBal })
          });
        } catch (e) {}
      }
      return true;
    } else {
      setCreditModalReq({ requiredCredits: amount, targetFeature: featureName });
      setShowCreditModal(true);
      return false;
    }
  };

  const buyCredits = (amount, packName = 'Credit Pack') => {
    const newBal = userCredits + amount;
    setUserCredits(newBal);
    try {
      localStorage.setItem('sm_user_credits', newBal.toString());
    } catch (e) {}
    if (user && user.email) {
      try {
        fetch('/api/register-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, credits: newBal })
        });
      } catch (e) {}
    }
  };

  const grantBonusCredits = (targetEmail, amount) => {
    if (!targetEmail) return;
    const clean = targetEmail.trim().toLowerCase();
    
    if (user && user.email && user.email.toLowerCase() === clean) {
      setUserCredits(prev => prev + amount);
    }

    setRegisteredUsersList(prev => prev.map(u => {
      if (u && u.user && u.user.toLowerCase() === clean) {
        const currentCreds = (u.profile && typeof u.profile.credits === 'number') ? u.profile.credits : 20;
        const newProf = { ...(u.profile || {}), credits: currentCreds + amount };
        return { ...u, profile: newProf };
      }
      return u;
    }));

    try {
      fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean, credits: 50 })
      });
    } catch (e) {}
  };

  // Navigation tab: 'landing' | 'client' | 'admin' | 'auth'
  const [currentTab, setCurrentTab] = useState('landing');
  
  // Auth modal visibility
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Admin Configurable Plans State
  const [plans, setPlans] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_admin_plans');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_PLANS;
  });

  const handleSavePlan = (updatedPlan) => {
    if (!updatedPlan) return;
    setPlans(prev => {
      const exists = prev.some(p => p.id === updatedPlan.id);
      let newPlans;
      if (exists) {
        newPlans = prev.map(p => p.id === updatedPlan.id ? updatedPlan : p);
      } else {
        newPlans = [...prev, updatedPlan];
      }
      try {
        localStorage.setItem('sm_admin_plans', JSON.stringify(newPlans));
      } catch (e) {}
      return newPlans;
    });
  };

  const handleDeletePlan = (planId) => {
    if (!planId) return;
    setPlans(prev => {
      const newPlans = prev.filter(p => p.id !== planId);
      try {
        localStorage.setItem('sm_admin_plans', JSON.stringify(newPlans));
      } catch (e) {}
      return newPlans;
    });
  };

  // League Configurations
  const [leagues, setLeagues] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_user_leagues');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'l1',
        name: 'High Stakes Alpha League',
        platform: 'ESPN',
        leagueId: '8492019',
        teamId: '3',
        scoring: 'PPR',
        espnS2: 'AE...[ENCRYPTED]',
        swid: '{SWID-882-ENCRYPTED}',
        status: 'Connected & Synced'
      }
    ];
  });

  const [activeLeagueId, setActiveLeagueId] = useState('l1');

  // AI Chat Messages
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      sender: 'supermacho',
      text: "WASSUP CHAMP! 🕶️ SuperMacho in the house. Your roster is looking lethal for Week 1, but we can make you MORE MONEY. Ask me anything about your lineup, waivers, or trade proposals!",
      timestamp: '10:00 AM'
    }
  ]);

  const INITIAL_BASE_USERS = [
    { id: 'u_100', user: 'zivo13@yahoo.com', plan: '300 Credits Commissioner ($24.99 USD)', date: '2026-08-23', status: 'Active Subscriber' },
    { id: 'u_101', user: 'zivo13@hotmail.com', plan: '20 Free Credits Rookie ($0.00 USD)', date: '2026-08-23', status: 'Active Subscriber' },
    { id: 'u_102', user: 'doctorluismoralesae@gmail.com', plan: '100 Credits Pro Champion ($9.99 USD)', date: '2026-08-23', status: 'Active Subscriber' }
  ];

  // Registered users store for Admin Dashboard
  const [registeredUsersList, setRegisteredUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_registered_users_list');
      const deletedMapStr = localStorage.getItem('sm_deleted_users');
      const deletedMap = deletedMapStr ? JSON.parse(deletedMapStr) : {};
      
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(u => u && u.user && !deletedMap[u.user.toLowerCase()]);
        }
      }
      return INITIAL_BASE_USERS.filter(u => !deletedMap[u.user.toLowerCase()]);
    } catch (e) {}
    return INITIAL_BASE_USERS;
  });

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState([]);
  const [accessCounts, setAccessCounts] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_access_counts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const fetchGlobalTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data && data.tickets && Array.isArray(data.tickets)) {
        setSupportTickets(data.tickets);
      }
    } catch (e) {}
  };

  // Fetch global registered users from Vercel API / Vite API
  const fetchGlobalUsers = async () => {
    try {
      const res = await fetch('/api/register-user');
      const data = await res.json();
      let deletedMap = {};
      try {
        deletedMap = JSON.parse(localStorage.getItem('sm_deleted_users') || '{}');
      } catch (e) {}

      if (data && data.users && Array.isArray(data.users) && data.users.length > 0) {
        const serverUsers = data.users.filter(u => u && u.user && !deletedMap[u.user.toLowerCase()]);
        if (serverUsers.length > 0) {
          setRegisteredUsersList(serverUsers);
          try {
            localStorage.setItem('sm_registered_users_list', JSON.stringify(serverUsers));
          } catch (e) {}
          return;
        }
      }

      // Fallback if server response is empty
      const fallbackList = INITIAL_BASE_USERS.filter(u => !deletedMap[u.user.toLowerCase()]);
      setRegisteredUsersList(fallbackList);
    } catch (e) {}
  };

  const handleDeleteUser = async (emailToDelete) => {
    if (!emailToDelete) return;
    const clean = emailToDelete.trim().toLowerCase();

    // 1. Record in local deleted map
    let deletedMap = {};
    try {
      deletedMap = JSON.parse(localStorage.getItem('sm_deleted_users') || '{}');
      deletedMap[clean] = true;
      localStorage.setItem('sm_deleted_users', JSON.stringify(deletedMap));
      localStorage.removeItem(`sm_user_${clean}`);
      localStorage.removeItem(`sm_profile_${clean}`);
    } catch (e) {}

    // 2. Update local state
    setRegisteredUsersList(prev => {
      const updated = prev.filter(u => u.user.toLowerCase() !== clean);
      try {
        localStorage.setItem('sm_registered_users_list', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Send DELETE request to API endpoint
    try {
      await fetch('/api/register-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean })
      });
    } catch (e) {}
  };

  const handleClearAllTestUsers = async () => {
    try {
      await fetch('/api/register-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAllTestUsers: true })
      });
    } catch (e) {}

    try {
      localStorage.removeItem('sm_registered_users_list');
      localStorage.removeItem('sm_deleted_users');
    } catch (e) {}

    setRegisteredUsersList([]);
  };

  const refreshAdminData = async () => {
    await Promise.all([fetchGlobalUsers(), fetchGlobalTickets()]);
  };

  useEffect(() => {
    fetchGlobalUsers();
    fetchGlobalTickets();
    const interval = setInterval(() => {
      fetchGlobalUsers();
      fetchGlobalTickets();
    }, 5000); // Live multi-computer auto-polling every 5s
    return () => clearInterval(interval);
  }, []);


  // Actions
  const handleLogin = (email, role = 'client') => {
    const cleanEmail = email.trim().toLowerCase();
    let userPlan = role === 'admin' ? 'SuperMacho Commissioner' : 'Free Rookie ($0/mo)';
    let userPlanId = role === 'admin' ? 'commissioner' : 'free';
    let userProfile = null;

    try {
      const savedUserJson = localStorage.getItem(`sm_user_${cleanEmail}`);
      if (savedUserJson) {
        const savedUser = JSON.parse(savedUserJson);
        if (savedUser.plan) {
          userPlan = savedUser.plan;
          userPlanId = userPlan.includes('Commissioner') ? 'commissioner' : userPlan.includes('Pro') ? 'pro' : 'free';
        }
      }
    } catch (e) {}

    try {
      const savedProfJson = localStorage.getItem(`sm_profile_${cleanEmail}`);
      if (savedProfJson) {
        userProfile = JSON.parse(savedProfJson);
        if (userProfile.prefLang) {
          setLang(userProfile.prefLang);
        }
      }
    } catch (e) {}

    // Track access count
    setAccessCounts(prev => {
      const current = prev[cleanEmail] || 0;
      const updated = { ...prev, [cleanEmail]: current + 1 };
      try {
        localStorage.setItem('sm_access_counts', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setUser({
      name: role === 'admin' ? 'SuperMacho Admin' : cleanEmail.split('@')[0],
      email: cleanEmail,
      role: role,
      plan: userPlan,
      planId: userPlanId,
      profile: userProfile,
      isLoggedIn: true
    });

    // Fetch persistent profile & leagues from server database (cross-computer sync)
    try {
      fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail, 
          action: 'login'
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.leagues && Array.isArray(data.leagues) && data.leagues.length > 0) {
            setLeagues(data.leagues);
            try {
              localStorage.setItem('sm_user_leagues', JSON.stringify(data.leagues));
            } catch (e) {}
          }
          if (data && data.profile) {
            setUser(prev => ({ ...prev, profile: data.profile }));
            if (data.profile.prefLang) {
              setLang(data.profile.prefLang);
            }
          }
        })
        .catch(() => {});
    } catch (e) {}

    setRegisteredUsersList(prev => {
      let deletedMap = {};
      try {
        deletedMap = JSON.parse(localStorage.getItem('sm_deleted_users') || '{}');
      } catch (e) {}

      if (deletedMap[cleanEmail]) {
        return prev.filter(u => u && u.user && u.user.toLowerCase() !== cleanEmail);
      }

      const exists = prev.some(u => u && u.user && u.user.toLowerCase() === cleanEmail);
      let updated;
      if (!exists) {
        updated = [
          {
            id: 'u_' + Date.now(),
            user: cleanEmail,
            plan: userPlan,
            date: 'Just now',
            status: 'Registered User',
            profile: userProfile
          },
          ...prev
        ];
      } else {
        updated = prev.map(u => u && u.user && u.user.toLowerCase() === cleanEmail ? { ...u, plan: userPlan, profile: userProfile || u.profile } : u);
      }
      try {
        localStorage.setItem('sm_registered_users_list', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setShowAuthModal(false);
    setCurrentTab(role === 'admin' ? 'admin' : 'client');
  };

  const handleLogout = () => {
    setUser({
      name: '',
      email: '',
      role: 'guest',
      planId: 'free',
      isLoggedIn: false
    });
    setCurrentTab('landing');
  };

  const handleCreateSupportTicket = async (subject, category, priority, message) => {
    if (!user || !user.email) return;
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.email,
          senderName: user.name || user.email.split('@')[0],
          subject,
          category,
          priority,
          message
        })
      });
      const data = await res.json();
      if (data && data.tickets) {
        setSupportTickets(data.tickets);
      }
    } catch (e) {
      // Fallback local state ticket
      const newT = {
        id: 'tick_' + Date.now(),
        user_email: user.email,
        subject,
        category,
        priority,
        status: 'Open',
        created_at: new Date().toISOString(),
        messages: [
          {
            sender: user.email,
            senderName: user.name || user.email.split('@')[0],
            text: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      setSupportTickets(prev => [newT, ...prev]);
    }
  };

  const handleReplySupportTicket = async (ticketId, message, senderEmail, senderName) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          ticketId,
          message,
          senderEmail: senderEmail || user?.email,
          senderName: senderName || user?.name
        })
      });
      const data = await res.json();
      if (data && data.tickets) {
        setSupportTickets(data.tickets);
      }
    } catch (e) {
      setSupportTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            messages: [
              ...t.messages,
              {
                sender: senderEmail || user?.email || 'support@supermacho.app',
                senderName: senderName || 'User',
                text: message,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return t;
      }));
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status, adminReply) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          status,
          adminReply
        })
      });
      const data = await res.json();
      if (data && data.tickets) {
        setSupportTickets(data.tickets);
      }
    } catch (e) {
      setSupportTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          const updatedMsgs = [...t.messages];
          if (adminReply) {
            updatedMsgs.push({
              sender: 'support@supermacho.app',
              senderName: 'SuperMacho Support Team',
              text: adminReply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }
          return { ...t, status: status || t.status, messages: updatedMsgs };
        }
        return t;
      }));
    }
  };

  const handleSaveLeague = (newLeagueData) => {
    if (!newLeagueData) return;
    let targetId = newLeagueData.id;
    let updatedList = [];

    setLeagues(prev => {
      const targetLeagueId = newLeagueData.leagueId;
      const existsIndex = prev.findIndex(l => (targetId && l.id === targetId) || (targetLeagueId && l.leagueId === targetLeagueId));

      if (existsIndex !== -1) {
        targetId = prev[existsIndex].id;
        updatedList = prev.map((l, idx) => idx === existsIndex ? { ...l, ...newLeagueData, id: targetId, status: 'Connected & Synced' } : l);
      } else {
        targetId = targetId || ('l_' + Date.now());
        const leagueObj = {
          ...newLeagueData,
          id: targetId,
          status: 'Connected & Synced'
        };
        updatedList = [...prev, leagueObj];
      }

      try {
        localStorage.setItem('sm_user_leagues', JSON.stringify(updatedList));
      } catch (e) {}

      return updatedList;
    });

    if (user && user.email) {
      try {
        fetch('/api/register-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            leagues: updatedList
          })
        });
      } catch (e) {}
    }

    if (targetId) {
      setActiveLeagueId(targetId);
    }
  };

  const handleAddLeague = (newLeague) => {
    handleSaveLeague(newLeague);
  };

  const handleSendAiMessage = (userText) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMsg = { sender: 'user', text: userText, timestamp: timeStr };
    
    // Formulate SuperMacho response
    let responseText = "BOOM! 🔥 Here is the SuperMacho breakdown: ";
    const lower = userText.toLowerCase();
    
    if (lower.includes('start') || lower.includes('sit') || lower.includes('lineup')) {
      responseText += "Start Patrick Mahomes and Justin Jefferson without hesitation! Swap Tee Higgins off your bench if CeeDee Lamb has any game-day quad tightness. High floor, max ceiling!";
    } else if (lower.includes('waiver') || lower.includes('pickup')) {
      responseText += "Drop your 3rd TE and drop 12% FAB ($14) on Kimani Vidal immediately. Gus Edwards is hobbled and Vidal will command 18+ touches this Sunday!";
    } else if (lower.includes('trade')) {
      responseText += "ACCEPT THAT TRADE! You are giving up bench depth to land an absolute WR1 monster. Your starting lineup projection increases by +6.3 points per game!";
    } else {
      responseText += "Always play aggressive for high upside, Champ. Keep your roster locked, grab the hottest waiver targets early, and let's go MAKE THAT MONEY!";
    }

    const aiMsg = { sender: 'supermacho', text: responseText, timestamp: timeStr };

    setAiChatMessages(prev => [...prev, userMsg, aiMsg]);
  };

  const currentLeague = leagues.find(l => l.id === activeLeagueId) || leagues[0] || { scoring: 'PPR' };

  return (
    <AppContext.Provider value={{
      lang,
      setLang,
      t,
      currentTab,
      setCurrentTab,
      user,
      setUser,
      showAuthModal,
      setShowAuthModal,
      authMode,
      setAuthMode,
      plans,
      setPlans,
      handleSavePlan,
      handleDeletePlan,
      leagues,
      activeLeagueId,
      setActiveLeagueId,
      currentLeague,
      handleAddLeague,
      handleSaveLeague,
      aiChatMessages,
      handleSendAiMessage,
      handleLogin,
      handleLogout,
      demoRoster: DEMO_ROSTER,
      demoWaivers: DEMO_WAIVERS,
      demoTrade: DEMO_TRADE_SCENARIO,
      adminMetrics: ADMIN_METRICS,
      registeredUsersList,
      customTranslations,
      activeTranslations,
      updateCustomTranslations,
      resetCustomTranslations,
      supportTickets,
      accessCounts,
      refreshAdminData,
      handleCreateSupportTicket,
      handleReplySupportTicket,
      handleUpdateTicketStatus,
      handleDeleteUser,
      handleClearAllTestUsers,
      userCredits,
      setUserCredits,
      deductCredits,
      buyCredits,
      grantBonusCredits,
      formatPrice,
      showCreditModal,
      setShowCreditModal,
      featureCreditCosts,
      updateFeatureCreditCosts
    }}>
      {children}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        requiredCredits={creditModalReq?.requiredCredits || 0}
        targetFeature={creditModalReq?.targetFeature || ''}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

