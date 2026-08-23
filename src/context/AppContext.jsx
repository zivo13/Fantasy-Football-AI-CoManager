import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PLANS, DEMO_ROSTER, DEMO_WAIVERS, DEMO_TRADE_SCENARIO, ADMIN_METRICS } from '../services/mockData';
import { TRANSLATIONS } from '../services/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Language state: 'en' | 'es' | 'pt'
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Navigation tab: 'landing' | 'client' | 'admin' | 'auth'
  const [currentTab, setCurrentTab] = useState('landing');
  
  // User state (Default to Guest for new visitors)
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: 'guest', // 'guest' | 'client' | 'admin'
    planId: 'free',
    isLoggedIn: false
  });

  // Auth modal visibility
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Admin Configurable Plans State
  const [plans, setPlans] = useState(INITIAL_PLANS);

  // League Configurations
  const [leagues, setLeagues] = useState([
    {
      id: 'l1',
      name: 'High Stakes Alpha League',
      platform: 'ESPN',
      leagueId: '8492019',
      teamId: '3',
      scoring: 'PPR',
      espnS2: 'AE...[ENCRYPTED]',
      swid: '{SWID-882-ENCRYPTED}',
      status: 'Connected'
    }
  ]);

  const [activeLeagueId, setActiveLeagueId] = useState('l1');

  // AI Chat Messages
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      sender: 'supermacho',
      text: "WASSUP CHAMP! 🕶️ SuperMacho in the house. Your roster is looking lethal for Week 1, but we can make you MORE MONEY. Ask me anything about your lineup, waivers, or trade proposals!",
      timestamp: '10:00 AM'
    }
  ]);

  // Registered users store for Admin Dashboard
  const [registeredUsersList, setRegisteredUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_registered_users_list');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Fetch global registered users from Vercel API
  useEffect(() => {
    const fetchGlobalUsers = async () => {
      try {
        const res = await fetch('/api/register-user');
        const data = await res.json();
        if (data && data.users && Array.isArray(data.users)) {
          setRegisteredUsersList(prev => {
            const combined = [...data.users];
            prev.forEach(p => {
              if (!combined.some(c => c.user.toLowerCase() === p.user.toLowerCase())) {
                combined.push(p);
              }
            });
            return combined;
          });
        }
      } catch (e) {}
    };

    fetchGlobalUsers();
    const interval = setInterval(fetchGlobalUsers, 10000); // Polling every 10s for Admin
    return () => clearInterval(interval);
  }, []);

  // Actions
  const handleLogin = (email, role = 'client') => {
    const cleanEmail = email.trim().toLowerCase();
    
    setUser({
      name: role === 'admin' ? 'SuperMacho Admin' : cleanEmail.split('@')[0],
      email: cleanEmail,
      role: role,
      planId: role === 'admin' ? 'commissioner' : 'pro',
      isLoggedIn: true
    });

    // Send global signup event to Vercel API endpoint
    try {
      fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, role })
      });
    } catch (e) {}

    if (role !== 'admin') {
      setRegisteredUsersList(prev => {
        const exists = prev.some(u => u.user.toLowerCase() === cleanEmail);
        if (!exists) {
          const updated = [
            {
              id: 'u_' + Date.now(),
              user: cleanEmail,
              plan: 'Pro Champion ($4.99/mo)',
              date: 'Just now',
              status: 'Registered User'
            },
            ...prev
          ];
          try {
            localStorage.setItem('sm_registered_users_list', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        }
        return prev;
      });
    }

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

  const handleSavePlan = (updatedPlan) => {
    setPlans(prev => {
      const exists = prev.some(p => p.id === updatedPlan.id);
      if (exists) {
        return prev.map(p => p.id === updatedPlan.id ? updatedPlan : p);
      } else {
        return [...prev, updatedPlan];
      }
    });
  };

  const handleDeletePlan = (planId) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
  };

  const handleAddLeague = (newLeague) => {
    const leagueObj = {
      ...newLeague,
      id: 'l_' + Date.now(),
      status: 'Connected'
    };
    setLeagues(prev => [...prev, leagueObj]);
    setActiveLeagueId(leagueObj.id);
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
      handleAddLeague,
      aiChatMessages,
      handleSendAiMessage,
      handleLogin,
      handleLogout,
      demoRoster: DEMO_ROSTER,
      demoWaivers: DEMO_WAIVERS,
      demoTrade: DEMO_TRADE_SCENARIO,
      adminMetrics: ADMIN_METRICS,
      registeredUsersList
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
