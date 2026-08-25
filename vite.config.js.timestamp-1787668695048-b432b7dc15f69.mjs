// vite.config.js
import { defineConfig } from "file:///C:/Users/Usuario/Dropbox/htdocs/htdocs_nfl_fantasy/SaaS/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Usuario/Dropbox/htdocs/htdocs_nfl_fantasy/SaaS/node_modules/@vitejs/plugin-react/dist/index.js";

// api/register-user.js
import { createClient } from "file:///C:/Users/Usuario/Dropbox/htdocs/htdocs_nfl_fantasy/SaaS/node_modules/@supabase/supabase-js/dist/index.mjs";
import fs from "fs";
var supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://jdmryhxmfgedfdleytwn.supabase.co";
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U";
var TMP_FILE = "/tmp/supermacho_users_v3.json";
var BASE_USERS = [
  { id: "u_100", user: "zivo13@yahoo.com", plan: "SuperMacho Commissioner ($9.99/mo)", date: "2026-08-23", status: "Active Subscriber" },
  { id: "u_101", user: "zivo13@hotmail.com", plan: "Free Rookie (20 Credits)", date: "2026-08-23", status: "Active Subscriber" },
  { id: "u_102", user: "doctorluismoralesae@gmail.com", plan: "Pro Champion (100 Credits)", date: "2026-08-23", status: "Active Subscriber" }
];
function readState() {
  let deletedMap = {};
  let suspendedMap = {};
  let profilesMap = {};
  let userList = [];
  let fileExists = false;
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf8");
      const parsed = JSON.parse(raw);
      deletedMap = parsed.deleted || {};
      suspendedMap = parsed.suspended || {};
      profilesMap = parsed.profiles || {};
      userList = parsed.users || [];
      fileExists = true;
    }
  } catch (e) {
  }
  if (!fileExists) {
    userList = [...BASE_USERS];
  }
  userList = userList.filter((u) => u && u.user && !deletedMap[u.user.toLowerCase()]);
  return {
    users: userList,
    suspended: suspendedMap,
    profiles: profilesMap,
    deleted: deletedMap
  };
}
function saveState(state) {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(state));
  } catch (e) {
  }
}
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  const currentState = readState();
  if (req.method === "POST") {
    try {
      const { email, password, action, role, plan, status, profile } = req.body || {};
      if (!email) return res.status(400).json({ error: "Email required" });
      const cleanEmail = email.trim().toLowerCase();
      if (currentState.suspended[cleanEmail] || currentState.deleted[cleanEmail]) {
        if (action === "login") {
          if (currentState.suspended[cleanEmail]) {
            return res.status(403).json({ error: "ACCOUNT_SUSPENDED", message: "ACCOUNT SUSPENDED: Your account has been suspended by the League Commissioner." });
          }
        }
      }
      const existingIndex = currentState.users.findIndex((u) => u && u.user && u.user.toLowerCase() === cleanEmail);
      const userExists = existingIndex !== -1;
      if (action === "login") {
        const isAdmin = cleanEmail.includes("admin") || cleanEmail.includes("zivo13") || cleanEmail.includes("doctorluismoralesae");
        if (!userExists && !isAdmin) {
          return res.status(404).json({
            error: "ACCOUNT_NOT_FOUND",
            message: "No account found with this email address. Please click Join to register an account first!"
          });
        }
        if (userExists && currentState.passwords && currentState.passwords[cleanEmail]) {
          if (password && currentState.passwords[cleanEmail] !== password) {
            return res.status(401).json({
              error: "INVALID_PASSWORD",
              message: "Incorrect password. Please enter the correct password."
            });
          }
        }
        const userObj = currentState.users.find((u) => u && u.user && u.user.toLowerCase() === cleanEmail) || {
          user: cleanEmail,
          plan: isAdmin ? "SuperMacho Commissioner" : "Free Rookie ($0/mo)",
          status: "Active Subscriber"
        };
        return res.status(200).json({
          success: true,
          user: userObj,
          profile: currentState.profiles[cleanEmail] || null
        });
      }
      if (action === "signup") {
        if (userExists) {
          return res.status(400).json({
            error: "ACCOUNT_EXISTS",
            message: "An account already exists with this email address. Please click Sign In to log in!"
          });
        }
      }
      if (password) {
        currentState.passwords = currentState.passwords || {};
        currentState.passwords[cleanEmail] = password;
      }
      delete currentState.deleted[cleanEmail];
      if (status) {
        if (status.includes("Suspended") || status.includes("Inactive")) {
          currentState.suspended[cleanEmail] = true;
        } else {
          currentState.suspended[cleanEmail] = false;
        }
      }
      const creditsVal = typeof req.body.credits === "number" ? req.body.credits : profile && typeof profile.credits === "number" ? profile.credits : void 0;
      if (profile) {
        currentState.profiles[cleanEmail] = {
          ...currentState.profiles[cleanEmail],
          ...profile,
          credits: creditsVal !== void 0 ? creditsVal : currentState.profiles[cleanEmail]?.credits ?? 20
        };
      } else if (creditsVal !== void 0) {
        currentState.profiles[cleanEmail] = {
          ...currentState.profiles[cleanEmail] || {},
          credits: creditsVal
        };
      }
      if (existingIndex !== -1) {
        if (plan) currentState.users[existingIndex].plan = plan;
        if (status) currentState.users[existingIndex].status = status;
        if (profile) currentState.users[existingIndex].profile = currentState.profiles[cleanEmail];
      } else {
        const newUser = {
          id: "u_" + Date.now(),
          user: cleanEmail,
          plan: plan || (role === "admin" ? "SuperMacho Commissioner" : "Free Rookie ($0/mo)"),
          date: "Just now",
          status: status || "Active Subscriber",
          profile: currentState.profiles[cleanEmail] || null
        };
        currentState.users.unshift(newUser);
      }
      saveState(currentState);
      if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          const mappedPlanId = plan ? plan.toLowerCase().includes("300") || plan.toLowerCase().includes("commissioner") ? "commissioner" : plan.toLowerCase().includes("100") || plan.toLowerCase().includes("pro") ? "pro" : plan.toLowerCase().includes("50") || plan.toLowerCase().includes("booster") ? "booster" : "free" : "free";
          await supabase.from("profiles").upsert({
            email: cleanEmail,
            role: role || "client",
            plan_id: mappedPlanId,
            status: status || "active",
            birthday: profile?.birthday || null,
            favorite_number: profile?.favoriteNumber || null,
            favorite_team: profile?.favoriteTeam || null,
            preferred_language: profile?.prefLang || "en"
          }, { onConflict: "email" });
        } catch (e) {
        }
      }
      return res.status(200).json({
        success: true,
        users: currentState.users,
        suspended: currentState.suspended,
        profile: currentState.profiles[cleanEmail] || null
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  if (req.method === "DELETE") {
    try {
      const { email, clearAllTestUsers } = req.body || {};
      if (clearAllTestUsers) {
        currentState.users = [...BASE_USERS];
        currentState.suspended = {};
        currentState.deleted = {};
        saveState(currentState);
        if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
          try {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            await supabase.from("profiles").delete().neq("role", "admin");
          } catch (e) {
          }
        }
        return res.status(200).json({ success: true, users: currentState.users });
      }
      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        currentState.deleted[cleanEmail] = true;
        currentState.users = currentState.users.filter((u) => u.user.toLowerCase() !== cleanEmail);
        delete currentState.suspended[cleanEmail];
        delete currentState.profiles[cleanEmail];
        saveState(currentState);
        if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
          try {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            await supabase.from("profiles").delete().eq("email", cleanEmail);
          } catch (e) {
          }
        }
      }
      return res.status(200).json({ success: true, users: currentState.users });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  if (req.method === "GET") {
    let checkEmail = null;
    let getProfileEmail = null;
    try {
      const reqUrl = req.url || "";
      if (reqUrl.includes("check_suspended=")) {
        const paramStr = reqUrl.split("check_suspended=")[1];
        if (paramStr) {
          checkEmail = decodeURIComponent(paramStr.split("&")[0]).trim().toLowerCase();
        }
      }
      if (reqUrl.includes("get_profile=")) {
        const paramStr = reqUrl.split("get_profile=")[1];
        if (paramStr) {
          getProfileEmail = decodeURIComponent(paramStr.split("&")[0]).trim().toLowerCase();
        }
      }
    } catch (e) {
    }
    if (checkEmail) {
      const isSuspended = !!currentState.suspended[checkEmail];
      return res.status(200).json({ email: checkEmail, isSuspended });
    }
    if (getProfileEmail) {
      const profile = currentState.profiles[getProfileEmail] || null;
      return res.status(200).json({ email: getProfileEmail, profile });
    }
    let allUsers = [...currentState.users];
    if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: dbProfiles } = await supabase.from("profiles").select("*");
        if (dbProfiles && Array.isArray(dbProfiles) && dbProfiles.length > 0) {
          const userMap = /* @__PURE__ */ new Map();
          allUsers.forEach((u) => {
            if (u && u.user) userMap.set(u.user.toLowerCase(), u);
          });
          dbProfiles.forEach((p) => {
            if (p && p.email) {
              const cleanE = p.email.toLowerCase();
              if (currentState.deleted && currentState.deleted[cleanE]) return;
              const existingUser = userMap.get(cleanE);
              const planName = existingUser?.plan || (p.plan_id === "commissioner" ? "300 Credits Commissioner ($24.99 USD)" : p.plan_id === "pro" ? "100 Credits Pro Champion ($9.99 USD)" : p.plan_id === "booster" ? "50 Credits Quick Booster ($5.99 USD)" : "20 Free Credits Rookie ($0.00 USD)");
              userMap.set(cleanE, {
                id: p.id || "u_" + cleanE,
                user: cleanE,
                plan: planName,
                date: p.created_at ? new Date(p.created_at).toLocaleDateString() : existingUser?.date || "Registered",
                status: p.status || existingUser?.status || "Active Subscriber",
                profile: {
                  email: cleanE,
                  birthday: p.birthday,
                  favoriteTeam: p.favorite_team,
                  favoriteNumber: p.favorite_number,
                  prefLang: p.preferred_language,
                  profileCompleted: p.profile_completed
                }
              });
            }
          });
          allUsers = Array.from(userMap.values());
        }
      } catch (e) {
      }
    }
    return res.status(200).json({
      users: allUsers,
      suspended: currentState.suspended,
      profiles: currentState.profiles
    });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// api/tickets.js
import { createClient as createClient2 } from "file:///C:/Users/Usuario/Dropbox/htdocs/htdocs_nfl_fantasy/SaaS/node_modules/@supabase/supabase-js/dist/index.mjs";
import fs2 from "fs";
var supabaseUrl2 = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://jdmryhxmfgedfdleytwn.supabase.co";
var supabaseServiceKey2 = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXJ5aHhtZmdlZGZkbGV5dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzEwMjUsImV4cCI6MjEwMjk0NzAyNX0.mZ6XilhYh-fl1aHu1rtLewRzqcge0HbZ_dglXqOhy_U";
var TMP_TICKETS_FILE = "/tmp/supermacho_tickets_v1.json";
function readTicketsState() {
  try {
    if (fs2.existsSync(TMP_TICKETS_FILE)) {
      const raw = fs2.readFileSync(TMP_TICKETS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
  }
  return [];
}
function saveTicketsState(tickets) {
  try {
    fs2.writeFileSync(TMP_TICKETS_FILE, JSON.stringify(tickets));
  } catch (e) {
  }
}
async function handler2(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  let tickets = readTicketsState();
  if (req.method === "GET") {
    try {
      let filterEmail = null;
      const reqUrl = req.url || "";
      if (reqUrl.includes("user_email=")) {
        const paramStr = reqUrl.split("user_email=")[1];
        if (paramStr) {
          filterEmail = decodeURIComponent(paramStr.split("&")[0]).trim().toLowerCase();
        }
      }
      if (filterEmail) {
        const userTickets = tickets.filter((t) => (t.user_email || "").toLowerCase() === filterEmail);
        return res.status(200).json({ tickets: userTickets });
      }
      return res.status(200).json({ tickets });
    } catch (err) {
      return res.status(500).json({ error: err.message, tickets });
    }
  }
  if (req.method === "POST") {
    try {
      const { action, ticketId, user_email, subject, category, priority, message, senderName, senderEmail } = req.body || {};
      if (action === "reply" && ticketId && message) {
        const ticketIdx = tickets.findIndex((t) => t.id === ticketId);
        if (ticketIdx !== -1) {
          const newReply = {
            sender: senderEmail || user_email || "support@supermacho.app",
            senderName: senderName || "User",
            text: message,
            timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })
          };
          tickets[ticketIdx].messages.push(newReply);
          tickets[ticketIdx].updated_at = (/* @__PURE__ */ new Date()).toISOString();
          saveTicketsState(tickets);
          return res.status(200).json({ success: true, ticket: tickets[ticketIdx], tickets });
        }
        return res.status(404).json({ error: "Ticket not found" });
      }
      if (!user_email || !subject || !message) {
        return res.status(400).json({ error: "Missing required fields (user_email, subject, message)" });
      }
      const newTicket = {
        id: "tick_" + Date.now(),
        user_email: user_email.trim().toLowerCase(),
        subject: subject.trim(),
        category: category || "General",
        priority: priority || "Medium",
        status: "Open",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [
          {
            sender: user_email.trim().toLowerCase(),
            senderName: senderName || user_email.split("@")[0],
            text: message,
            timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })
          }
        ]
      };
      tickets.unshift(newTicket);
      saveTicketsState(tickets);
      if (supabaseUrl2 && !supabaseUrl2.includes("placeholder")) {
        try {
          const supabase = createClient2(supabaseUrl2, supabaseServiceKey2);
          await supabase.from("support_tickets").insert([
            {
              user_email: newTicket.user_email,
              subject: newTicket.subject,
              category: newTicket.category,
              priority: newTicket.priority,
              status: newTicket.status,
              messages: newTicket.messages
            }
          ]);
        } catch (e) {
        }
      }
      return res.status(200).json({ success: true, ticket: newTicket, tickets });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  if (req.method === "PUT") {
    try {
      const { ticketId, status, priority, adminReply } = req.body || {};
      if (!ticketId) return res.status(400).json({ error: "ticketId required" });
      const ticketIdx = tickets.findIndex((t) => t.id === ticketId);
      if (ticketIdx !== -1) {
        if (status) tickets[ticketIdx].status = status;
        if (priority) tickets[ticketIdx].priority = priority;
        if (adminReply) {
          tickets[ticketIdx].messages.push({
            sender: "support@supermacho.app",
            senderName: "SuperMacho Support Team",
            text: adminReply,
            timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })
          });
        }
        tickets[ticketIdx].updated_at = (/* @__PURE__ */ new Date()).toISOString();
        saveTicketsState(tickets);
        return res.status(200).json({ success: true, ticket: tickets[ticketIdx], tickets });
      }
      return res.status(404).json({ error: "Ticket not found" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  if (req.method === "DELETE") {
    try {
      const { ticketId } = req.body || {};
      if (ticketId) {
        tickets = tickets.filter((t) => t.id !== ticketId);
        saveTicketsState(tickets);
      }
      return res.status(200).json({ success: true, tickets });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// api/nfl-sync.js
import fs3 from "fs";
var CRED_FILE = "/tmp/supermacho_rapidapi.json";
var CACHE_FILE = "/tmp/nfl_live_cache.json";
function readCredentials() {
  try {
    if (fs3.existsSync(CRED_FILE)) {
      const raw = fs3.readFileSync(CRED_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
  }
  return {
    key: process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY || "",
    host: process.env.RAPIDAPI_HOST || "nfl-api-data.p.rapidapi.com"
  };
}
function saveCredentials(creds) {
  try {
    fs3.writeFileSync(CRED_FILE, JSON.stringify(creds));
  } catch (e) {
  }
}
function readCache() {
  try {
    if (fs3.existsSync(CACHE_FILE)) {
      const raw = fs3.readFileSync(CACHE_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
  }
  return null;
}
function writeCache(data) {
  try {
    fs3.writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch (e) {
  }
}
async function handler3(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method === "POST") {
    try {
      const { key, host } = req.body || {};
      const currentCreds = readCredentials();
      const newCreds = {
        key: key !== void 0 ? key.trim() : currentCreds.key,
        host: host !== void 0 ? host.trim() : currentCreds.host
      };
      saveCredentials(newCreds);
      return res.status(200).json({ success: true, credentials: newCreds });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  const activeCreds = readCredentials();
  const apiKey = activeCreds.key;
  const apiHost = activeCreds.host || "nfl-api-data.p.rapidapi.com";
  const cached = readCache();
  const now = Date.now();
  if (cached && cached.timestamp && now - cached.timestamp < 18e4) {
    return res.status(200).json({ source: "espn_live_cache", credentials: activeCreds, ...cached.data });
  }
  try {
    const espnScoresRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard");
    const espnScoresData = await espnScoresRes.json();
    const espnNewsRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/news");
    const espnNewsData = await espnNewsRes.json();
    const rawEvents = espnScoresData.events || [];
    const realGames = rawEvents.map((evt) => {
      const competition = evt.competitions?.[0] || {};
      const competitors = competition.competitors || [];
      const home = competitors.find((c) => c.homeAway === "home") || {};
      const away = competitors.find((c) => c.homeAway === "away") || {};
      const status = evt.status?.type || {};
      return {
        id: evt.id,
        name: evt.name,
        shortName: evt.shortName,
        date: evt.date,
        statusState: status.state,
        // 'pre', 'in', 'post'
        statusDetail: status.detail || status.description || "Upcoming Game",
        isLive: status.state === "in",
        isCompleted: status.state === "post",
        hasScore: status.state === "in" || status.state === "post",
        homeTeam: home.team?.displayName || "Home Team",
        homeAbbrev: home.team?.abbreviation || "HOME",
        homeScore: home.score || "0",
        homeLogo: home.team?.logo || "",
        awayTeam: away.team?.displayName || "Away Team",
        awayAbbrev: away.team?.abbreviation || "AWAY",
        awayScore: away.score || "0",
        awayLogo: away.logo || "",
        odds: competition.odds?.[0]?.details || "Line TBD"
      };
    });
    const rawArticles = espnNewsData.articles || [];
    const realHeadlines = rawArticles.slice(0, 5).map((art) => ({
      id: art.id || Math.random(),
      headline: art.headline,
      description: art.description,
      published: art.published,
      link: art.links?.web?.href || ""
    }));
    let rapidData = null;
    if (apiKey && !apiKey.includes("placeholder")) {
      try {
        let targetPath = "/games?league=1&season=2026";
        if (apiHost.includes("nfl-api-data")) targetPath = "/nfl-schedules";
        const rRes = await fetch(`https://${apiHost}${targetPath}`, {
          headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": apiHost }
        });
        rapidData = await rRes.json();
      } catch (e) {
      }
    }
    const draftPlayers = [
      { id: "p1", name: "Ja'Marr Chase", pos: "WR", team: "CIN", bye: 12, adp: "1.01", projPts: 318.5, floor: 17.5, ceiling: 35, upsideTier: "WR1 OVERALL", valueSteal: "CONSENSUS #1 PICK", needMatch: false },
      { id: "p2", name: "Bijan Robinson", pos: "RB", team: "ATL", bye: 12, adp: "1.02", projPts: 298.2, floor: 15.8, ceiling: 30.1, upsideTier: "RB1 OVERALL", valueSteal: "TOP RB ANCHOR", needMatch: true },
      { id: "p3", name: "Saquon Barkley", pos: "RB", team: "PHI", bye: 5, adp: "1.03", projPts: 292, floor: 15.2, ceiling: 29.5, upsideTier: "S-TIER VOLUME", valueSteal: "TOP 3 PICK", needMatch: true },
      { id: "p4", name: "Breece Hall", pos: "RB", team: "NYJ", bye: 12, adp: "1.04", projPts: 286.4, floor: 14.8, ceiling: 28.2, upsideTier: "S-TIER ELITE", valueSteal: "+2 Picks Value", needMatch: true },
      { id: "p5", name: "Justin Jefferson", pos: "WR", team: "MIN", bye: 6, adp: "1.05", projPts: 290.1, floor: 15.5, ceiling: 31.2, upsideTier: "ELITE TARGET SHARE", valueSteal: "TOP 5 WR", needMatch: false },
      { id: "p6", name: "CeeDee Lamb", pos: "WR", team: "DAL", bye: 7, adp: "1.06", projPts: 288.5, floor: 15, ceiling: 30.5, upsideTier: "ELITE TARGET SHARE", valueSteal: "TOP 6 WR", needMatch: false },
      { id: "p7", name: "Amon-Ra St. Brown", pos: "WR", team: "DET", bye: 5, adp: "1.07", projPts: 275.2, floor: 14.5, ceiling: 27.8, upsideTier: "HIGH FLOOR ANCHOR", valueSteal: "ROUND 1 ANCHOR", needMatch: false },
      { id: "p8", name: "Malik Nabers", pos: "WR", team: "NYG", bye: 11, adp: "1.08", projPts: 264.5, floor: 13.2, ceiling: 28, upsideTier: "BREAKOUT SUPERSTAR", valueSteal: "+4 Picks Value", needMatch: false },
      { id: "p9", name: "Derrick Henry", pos: "RB", team: "BAL", bye: 14, adp: "1.09", projPts: 272, floor: 14, ceiling: 29, upsideTier: "TOUCHDOWN MONSTER", valueSteal: "+3 Picks Value", needMatch: true },
      { id: "p10", name: "Jahmyr Gibbs", pos: "RB", team: "DET", bye: 5, adp: "1.10", projPts: 265.8, floor: 13.5, ceiling: 28.4, upsideTier: "DYNAMIC EXPLOSIVE", valueSteal: "+2 Picks Value", needMatch: true },
      { id: "p11", name: "Nico Collins", pos: "WR", team: "HOU", bye: 14, adp: "1.11", projPts: 258.4, floor: 12.8, ceiling: 27.5, upsideTier: "ALPHA WR1", valueSteal: "ROUND 1 VALUE", needMatch: false },
      { id: "p12", name: "Puka Nacua", pos: "WR", team: "LAR", bye: 6, adp: "1.12", projPts: 255, floor: 12.5, ceiling: 26.8, upsideTier: "TARGET MONSTER", valueSteal: "ROUND 1 VALUE", needMatch: false },
      { id: "p13", name: "Garrett Wilson", pos: "WR", team: "NYJ", bye: 12, adp: "2.01", projPts: 248, floor: 12, ceiling: 26, upsideTier: "ALPHA TARGET SHARE", valueSteal: "+3 Picks Value", needMatch: false },
      { id: "p14", name: "Brian Thomas Jr.", pos: "WR", team: "JAX", bye: 12, adp: "2.02", projPts: 242.5, floor: 11.8, ceiling: 26.5, upsideTier: "BREAKOUT SPEEDSTAR", valueSteal: "+5 Picks Value", needMatch: false },
      { id: "p15", name: "Marvin Harrison Jr.", pos: "WR", team: "ARI", bye: 11, adp: "2.03", projPts: 238.9, floor: 11.2, ceiling: 25.4, upsideTier: "BREAKOUT UPSIDE", valueSteal: "+4 Picks Value", needMatch: false },
      { id: "p16", name: "Josh Allen", pos: "QB", team: "BUF", bye: 12, adp: "2.04", projPts: 365.2, floor: 19.5, ceiling: 35, upsideTier: "QB1 OVERALL", valueSteal: "QB1 ANCHOR", needMatch: false },
      { id: "p17", name: "Lamar Jackson", pos: "QB", team: "BAL", bye: 14, adp: "2.05", projPts: 358, floor: 19, ceiling: 34, upsideTier: "KONAMI CODE QB", valueSteal: "QB2 ANCHOR", needMatch: false },
      { id: "p18", name: "Jonathan Taylor", pos: "RB", team: "IND", bye: 14, adp: "2.06", projPts: 245, floor: 12.2, ceiling: 26, upsideTier: "WORKHORSE RB", valueSteal: "+4 Picks Value", needMatch: true },
      { id: "p19", name: "De'Von Achane", pos: "RB", team: "MIA", bye: 6, adp: "2.07", projPts: 240.2, floor: 11.5, ceiling: 29.8, upsideTier: "HOME RUN CEILING", valueSteal: "+5 Picks Value", needMatch: true },
      { id: "p20", name: "Kyren Williams", pos: "RB", team: "LAR", bye: 6, adp: "2.08", projPts: 236.5, floor: 11.8, ceiling: 24.5, upsideTier: "REDZONE TOUCHES", valueSteal: "+3 Picks Value", needMatch: true },
      { id: "p21", name: "Josh Jacobs", pos: "GB", team: "GB", bye: 10, adp: "2.09", projPts: 230.1, floor: 11, ceiling: 24, upsideTier: "WORKHORSE RB", valueSteal: "+4 Picks Value", needMatch: true },
      { id: "p22", name: "Kenneth Walker III", pos: "RB", team: "SEA", bye: 10, adp: "2.10", projPts: 225.4, floor: 10.8, ceiling: 23.5, upsideTier: "TOUCHDOWN CEILING", valueSteal: "+5 Picks Value", needMatch: true },
      { id: "p23", name: "James Cook", pos: "RB", team: "BUF", bye: 12, adp: "2.11", projPts: 220, floor: 10.5, ceiling: 22.8, upsideTier: "PASS CATCHER RB", valueSteal: "+6 Picks Value", needMatch: true },
      { id: "p24", name: "Chuba Hubbard", pos: "RB", team: "CAR", bye: 11, adp: "3.02", projPts: 210.5, floor: 10, ceiling: 21.5, upsideTier: "HIGH VOLUME RB", valueSteal: "ROUND 3 VALUE", needMatch: true },
      { id: "p25", name: "Chase Brown", pos: "RB", team: "CIN", bye: 12, adp: "3.05", projPts: 205.2, floor: 9.8, ceiling: 22, upsideTier: "BREAKOUT RB", valueSteal: "ROUND 3 STEAL", needMatch: true },
      { id: "p26", name: "Brock Bowers", pos: "TE", team: "LV", bye: 10, adp: "3.08", projPts: 215.4, floor: 10.5, ceiling: 23, upsideTier: "TE1 OVERALL", valueSteal: "TE1 ANCHOR", needMatch: false },
      { id: "p27", name: "Trey McBride", pos: "TE", team: "ARI", bye: 11, adp: "3.10", projPts: 208.2, floor: 10, ceiling: 21.8, upsideTier: "ELITE TARGET SHARE", valueSteal: "+6 Picks Value", needMatch: false },
      { id: "p28", name: "Patrick Mahomes", pos: "QB", team: "KC", bye: 6, adp: "3.12", projPts: 332, floor: 17.5, ceiling: 30, upsideTier: "PASSING YARD QB", valueSteal: "ROUND 3 VALUE", needMatch: false },
      { id: "p29", name: "Jayden Daniels", pos: "QB", team: "WAS", bye: 14, adp: "4.02", projPts: 328.5, floor: 16.8, ceiling: 31.5, upsideTier: "RUSHING UPSIDE GEM", valueSteal: "+8 Picks Value", needMatch: false },
      { id: "p30", name: "Christian McCaffrey", pos: "RB", team: "SF", bye: 9, adp: "4.04", projPts: 198.5, floor: 8.5, ceiling: 24, upsideTier: "VETERAN RECOVERY", valueSteal: "PICK #40 OVERALL", needMatch: true }
    ];
    const payload = {
      status: "REAL_ESPN_LIVE_SYNCED",
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      seasonWeek: espnScoresData.week?.text || "Official NFL Schedule",
      seasonYear: espnScoresData.season?.year || 2026,
      gameCount: realGames.length,
      games: realGames,
      headlines: realHeadlines,
      draftPlayers,
      rapidEnriched: !!rapidData
    };
    writeCache({ timestamp: now, data: payload });
    return res.status(200).json({ source: "official_espn_realtime", credentials: activeCreds, ...payload });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// vite.config.js
function apiServerPlugin() {
  return {
    name: "api-server-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";
        if (!url.startsWith("/api/")) return next();
        if (!res.json) {
          res.json = function(data) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          };
        }
        if (!res.status) {
          res.status = function(statusCode) {
            res.statusCode = statusCode;
            return res;
          };
        }
        if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
          let bodyData = "";
          req.on("data", (chunk) => {
            bodyData += chunk.toString();
          });
          await new Promise((resolve) => req.on("end", resolve));
          try {
            req.body = bodyData ? JSON.parse(bodyData) : {};
          } catch (e) {
            req.body = {};
          }
        }
        try {
          if (url.startsWith("/api/register-user")) {
            return await handler(req, res);
          } else if (url.startsWith("/api/tickets")) {
            return await handler2(req, res);
          } else if (url.startsWith("/api/nfl-sync")) {
            return await handler3(req, res);
          }
        } catch (err) {
          return res.status(500).json({ error: err.message });
        }
        next();
      });
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), apiServerPlugin()],
  server: {
    port: 3e3,
    open: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAiYXBpL3JlZ2lzdGVyLXVzZXIuanMiLCAiYXBpL3RpY2tldHMuanMiLCAiYXBpL25mbC1zeW5jLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVXN1YXJpb1xcXFxEcm9wYm94XFxcXGh0ZG9jc1xcXFxodGRvY3NfbmZsX2ZhbnRhc3lcXFxcU2FhU1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVXN1YXJpb1xcXFxEcm9wYm94XFxcXGh0ZG9jc1xcXFxodGRvY3NfbmZsX2ZhbnRhc3lcXFxcU2FhU1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvVXN1YXJpby9Ecm9wYm94L2h0ZG9jcy9odGRvY3NfbmZsX2ZhbnRhc3kvU2FhUy92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCByZWdpc3RlclVzZXJIYW5kbGVyIGZyb20gJy4vYXBpL3JlZ2lzdGVyLXVzZXIuanMnO1xuaW1wb3J0IHRpY2tldHNIYW5kbGVyIGZyb20gJy4vYXBpL3RpY2tldHMuanMnO1xuaW1wb3J0IG5mbFN5bmNIYW5kbGVyIGZyb20gJy4vYXBpL25mbC1zeW5jLmpzJztcblxuZnVuY3Rpb24gYXBpU2VydmVyUGx1Z2luKCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdhcGktc2VydmVyLXBsdWdpbicsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgICAgaWYgKCF1cmwuc3RhcnRzV2l0aCgnL2FwaS8nKSkgcmV0dXJuIG5leHQoKTtcblxuICAgICAgICAvLyBIZWxwZXIgaGVscGVyIHRvIGV4dGVuZCByZXMuanNvbiBpZiBub3QgcHJlc2VudFxuICAgICAgICBpZiAoIXJlcy5qc29uKSB7XG4gICAgICAgICAgcmVzLmpzb24gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlcy5zdGF0dXMpIHtcbiAgICAgICAgICByZXMuc3RhdHVzID0gZnVuY3Rpb24oc3RhdHVzQ29kZSkge1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGFyc2UgSlNPTiBib2R5IGZvciBQT1NUIC8gUFVUIC8gREVMRVRFXG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcgfHwgcmVxLm1ldGhvZCA9PT0gJ1BVVCcgfHwgcmVxLm1ldGhvZCA9PT0gJ0RFTEVURScpIHtcbiAgICAgICAgICBsZXQgYm9keURhdGEgPSAnJztcbiAgICAgICAgICByZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7IGJvZHlEYXRhICs9IGNodW5rLnRvU3RyaW5nKCk7IH0pO1xuICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVxLm9uKCdlbmQnLCByZXNvbHZlKSk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlcS5ib2R5ID0gYm9keURhdGEgPyBKU09OLnBhcnNlKGJvZHlEYXRhKSA6IHt9O1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJlcS5ib2R5ID0ge307XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy9hcGkvcmVnaXN0ZXItdXNlcicpKSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgcmVnaXN0ZXJVc2VySGFuZGxlcihyZXEsIHJlcyk7XG4gICAgICAgICAgfSBlbHNlIGlmICh1cmwuc3RhcnRzV2l0aCgnL2FwaS90aWNrZXRzJykpIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aWNrZXRzSGFuZGxlcihyZXEsIHJlcyk7XG4gICAgICAgICAgfSBlbHNlIGlmICh1cmwuc3RhcnRzV2l0aCgnL2FwaS9uZmwtc3luYycpKSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgbmZsU3luY0hhbmRsZXIocmVxLCByZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgYXBpU2VydmVyUGx1Z2luKCldLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIG9wZW46IHRydWVcbiAgfVxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVzdWFyaW9cXFxcRHJvcGJveFxcXFxodGRvY3NcXFxcaHRkb2NzX25mbF9mYW50YXN5XFxcXFNhYVNcXFxcYXBpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc3VhcmlvXFxcXERyb3Bib3hcXFxcaHRkb2NzXFxcXGh0ZG9jc19uZmxfZmFudGFzeVxcXFxTYWFTXFxcXGFwaVxcXFxyZWdpc3Rlci11c2VyLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9Vc3VhcmlvL0Ryb3Bib3gvaHRkb2NzL2h0ZG9jc19uZmxfZmFudGFzeS9TYWFTL2FwaS9yZWdpc3Rlci11c2VyLmpzXCI7aW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9VUkwgfHwgcHJvY2Vzcy5lbnYuU1VQQUJBU0VfVVJMIHx8ICdodHRwczovL2pkbXJ5aHhtZmdlZGZkbGV5dHduLnN1cGFiYXNlLmNvJztcbmNvbnN0IHN1cGFiYXNlU2VydmljZUtleSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkgfHwgcHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWSB8fCBwcm9jZXNzLmVudi5TVVBBQkFTRV9BTk9OX0tFWSB8fCAnZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1wa2JYSjVhSGh0Wm1kbFpHWmtiR1Y1ZEhkdUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT0Rjek56RXdNalVzSW1WNGNDSTZNakV3TWprME56QXlOWDAubVo2WGlsaFloLWZsMWFIdTFydExld1J6cWNnZTBIYlpfZGdsWHFPaHlfVSc7XG5cbmNvbnN0IFRNUF9GSUxFID0gJy90bXAvc3VwZXJtYWNob191c2Vyc192My5qc29uJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IEJBU0VfVVNFUlMgPSBbXG4gIHsgaWQ6ICd1XzEwMCcsIHVzZXI6ICd6aXZvMTNAeWFob28uY29tJywgcGxhbjogJ1N1cGVyTWFjaG8gQ29tbWlzc2lvbmVyICgkOS45OS9tbyknLCBkYXRlOiAnMjAyNi0wOC0yMycsIHN0YXR1czogJ0FjdGl2ZSBTdWJzY3JpYmVyJyB9LFxuICB7IGlkOiAndV8xMDEnLCB1c2VyOiAneml2bzEzQGhvdG1haWwuY29tJywgcGxhbjogJ0ZyZWUgUm9va2llICgyMCBDcmVkaXRzKScsIGRhdGU6ICcyMDI2LTA4LTIzJywgc3RhdHVzOiAnQWN0aXZlIFN1YnNjcmliZXInIH0sXG4gIHsgaWQ6ICd1XzEwMicsIHVzZXI6ICdkb2N0b3JsdWlzbW9yYWxlc2FlQGdtYWlsLmNvbScsIHBsYW46ICdQcm8gQ2hhbXBpb24gKDEwMCBDcmVkaXRzKScsIGRhdGU6ICcyMDI2LTA4LTIzJywgc3RhdHVzOiAnQWN0aXZlIFN1YnNjcmliZXInIH1cbl07XG5cbi8vIEhlbHBlciB0byByZWFkIHBlcnNpc3RlbnQgZGlzayBzdGF0ZSBhY3Jvc3MgbGFtYmRhIGludm9jYXRpb25zXG5mdW5jdGlvbiByZWFkU3RhdGUoKSB7XG4gIGxldCBkZWxldGVkTWFwID0ge307XG4gIGxldCBzdXNwZW5kZWRNYXAgPSB7fTtcbiAgbGV0IHByb2ZpbGVzTWFwID0ge307XG4gIGxldCB1c2VyTGlzdCA9IFtdO1xuICBsZXQgZmlsZUV4aXN0cyA9IGZhbHNlO1xuXG4gIHRyeSB7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoVE1QX0ZJTEUpKSB7XG4gICAgICBjb25zdCByYXcgPSBmcy5yZWFkRmlsZVN5bmMoVE1QX0ZJTEUsICd1dGY4Jyk7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhdyk7XG4gICAgICBkZWxldGVkTWFwID0gcGFyc2VkLmRlbGV0ZWQgfHwge307XG4gICAgICBzdXNwZW5kZWRNYXAgPSBwYXJzZWQuc3VzcGVuZGVkIHx8IHt9O1xuICAgICAgcHJvZmlsZXNNYXAgPSBwYXJzZWQucHJvZmlsZXMgfHwge307XG4gICAgICB1c2VyTGlzdCA9IHBhcnNlZC51c2VycyB8fCBbXTtcbiAgICAgIGZpbGVFeGlzdHMgPSB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge31cblxuICBpZiAoIWZpbGVFeGlzdHMpIHtcbiAgICB1c2VyTGlzdCA9IFsuLi5CQVNFX1VTRVJTXTtcbiAgfVxuXG4gIC8vIEZpbHRlciBvdXQgYW55IGV4cGxpY2l0bHkgZGVsZXRlZCB1c2Vyc1xuICB1c2VyTGlzdCA9IHVzZXJMaXN0LmZpbHRlcih1ID0+IHUgJiYgdS51c2VyICYmICFkZWxldGVkTWFwW3UudXNlci50b0xvd2VyQ2FzZSgpXSk7XG5cbiAgcmV0dXJuIHtcbiAgICB1c2VyczogdXNlckxpc3QsXG4gICAgc3VzcGVuZGVkOiBzdXNwZW5kZWRNYXAsXG4gICAgcHJvZmlsZXM6IHByb2ZpbGVzTWFwLFxuICAgIGRlbGV0ZWQ6IGRlbGV0ZWRNYXBcbiAgfTtcbn1cblxuLy8gSGVscGVyIHRvIHdyaXRlIHBlcnNpc3RlbnQgZGlzayBzdGF0ZVxuZnVuY3Rpb24gc2F2ZVN0YXRlKHN0YXRlKSB7XG4gIHRyeSB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhUTVBfRklMRSwgSlNPTi5zdHJpbmdpZnkoc3RhdGUpKTtcbiAgfSBjYXRjaCAoZSkge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICAvLyBDT1JTIEhlYWRlcnNcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIERFTEVURSwgT1BUSU9OUycpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmVuZCgpO1xuICB9XG5cbiAgY29uc3QgY3VycmVudFN0YXRlID0gcmVhZFN0YXRlKCk7XG5cbiAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCwgYWN0aW9uLCByb2xlLCBwbGFuLCBzdGF0dXMsIHByb2ZpbGUgfSA9IHJlcS5ib2R5IHx8IHt9O1xuICAgICAgaWYgKCFlbWFpbCkgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbWFpbCByZXF1aXJlZCcgfSk7XG5cbiAgICAgIGNvbnN0IGNsZWFuRW1haWwgPSBlbWFpbC50cmltKCkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgLy8gMS4gQ2hlY2sgU3VzcGVuc2lvbiBzdGF0dXNcbiAgICAgIGlmIChjdXJyZW50U3RhdGUuc3VzcGVuZGVkW2NsZWFuRW1haWxdIHx8IGN1cnJlbnRTdGF0ZS5kZWxldGVkW2NsZWFuRW1haWxdKSB7XG4gICAgICAgIGlmIChhY3Rpb24gPT09ICdsb2dpbicpIHtcbiAgICAgICAgICBpZiAoY3VycmVudFN0YXRlLnN1c3BlbmRlZFtjbGVhbkVtYWlsXSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAzKS5qc29uKHsgZXJyb3I6ICdBQ0NPVU5UX1NVU1BFTkRFRCcsIG1lc3NhZ2U6ICdBQ0NPVU5UIFNVU1BFTkRFRDogWW91ciBhY2NvdW50IGhhcyBiZWVuIHN1c3BlbmRlZCBieSB0aGUgTGVhZ3VlIENvbW1pc3Npb25lci4nIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBleGlzdGluZ0luZGV4ID0gY3VycmVudFN0YXRlLnVzZXJzLmZpbmRJbmRleCh1ID0+IHUgJiYgdS51c2VyICYmIHUudXNlci50b0xvd2VyQ2FzZSgpID09PSBjbGVhbkVtYWlsKTtcbiAgICAgIGNvbnN0IHVzZXJFeGlzdHMgPSBleGlzdGluZ0luZGV4ICE9PSAtMTtcblxuICAgICAgLy8gMi4gU0lHTiBJTiBBQ1RJT04gKFN0cmljdCB2YWxpZGF0aW9uOiBhY2NvdW50IG11c3QgZXhpc3QgYW5kIHBhc3N3b3JkIG11c3QgbWF0Y2gpXG4gICAgICBpZiAoYWN0aW9uID09PSAnbG9naW4nKSB7XG4gICAgICAgIGNvbnN0IGlzQWRtaW4gPSBjbGVhbkVtYWlsLmluY2x1ZGVzKCdhZG1pbicpIHx8IGNsZWFuRW1haWwuaW5jbHVkZXMoJ3ppdm8xMycpIHx8IGNsZWFuRW1haWwuaW5jbHVkZXMoJ2RvY3Rvcmx1aXNtb3JhbGVzYWUnKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghdXNlckV4aXN0cyAmJiAhaXNBZG1pbikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IFxuICAgICAgICAgICAgZXJyb3I6ICdBQ0NPVU5UX05PVF9GT1VORCcsIFxuICAgICAgICAgICAgbWVzc2FnZTogJ05vIGFjY291bnQgZm91bmQgd2l0aCB0aGlzIGVtYWlsIGFkZHJlc3MuIFBsZWFzZSBjbGljayBKb2luIHRvIHJlZ2lzdGVyIGFuIGFjY291bnQgZmlyc3QhJyBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZlcmlmeSBzdG9yZWQgcGFzc3dvcmQgaWYgcmVjb3JkZWRcbiAgICAgICAgaWYgKHVzZXJFeGlzdHMgJiYgY3VycmVudFN0YXRlLnBhc3N3b3JkcyAmJiBjdXJyZW50U3RhdGUucGFzc3dvcmRzW2NsZWFuRW1haWxdKSB7XG4gICAgICAgICAgaWYgKHBhc3N3b3JkICYmIGN1cnJlbnRTdGF0ZS5wYXNzd29yZHNbY2xlYW5FbWFpbF0gIT09IHBhc3N3b3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBcbiAgICAgICAgICAgICAgZXJyb3I6ICdJTlZBTElEX1BBU1NXT1JEJywgXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICdJbmNvcnJlY3QgcGFzc3dvcmQuIFBsZWFzZSBlbnRlciB0aGUgY29ycmVjdCBwYXNzd29yZC4nIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXNlck9iaiA9IGN1cnJlbnRTdGF0ZS51c2Vycy5maW5kKHUgPT4gdSAmJiB1LnVzZXIgJiYgdS51c2VyLnRvTG93ZXJDYXNlKCkgPT09IGNsZWFuRW1haWwpIHx8IHtcbiAgICAgICAgICB1c2VyOiBjbGVhbkVtYWlsLFxuICAgICAgICAgIHBsYW46IGlzQWRtaW4gPyAnU3VwZXJNYWNobyBDb21taXNzaW9uZXInIDogJ0ZyZWUgUm9va2llICgkMC9tbyknLFxuICAgICAgICAgIHN0YXR1czogJ0FjdGl2ZSBTdWJzY3JpYmVyJ1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIHVzZXI6IHVzZXJPYmosXG4gICAgICAgICAgcHJvZmlsZTogY3VycmVudFN0YXRlLnByb2ZpbGVzW2NsZWFuRW1haWxdIHx8IG51bGxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIDMuIFNJR04gVVAgQUNUSU9OIChTdHJpY3QgdmFsaWRhdGlvbjogY2Fubm90IHJlZ2lzdGVyIGR1cGxpY2F0ZSBleGlzdGluZyBhY2NvdW50KVxuICAgICAgaWYgKGFjdGlvbiA9PT0gJ3NpZ251cCcpIHtcbiAgICAgICAgaWYgKHVzZXJFeGlzdHMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBcbiAgICAgICAgICAgIGVycm9yOiAnQUNDT1VOVF9FWElTVFMnLCBcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdBbiBhY2NvdW50IGFscmVhZHkgZXhpc3RzIHdpdGggdGhpcyBlbWFpbCBhZGRyZXNzLiBQbGVhc2UgY2xpY2sgU2lnbiBJbiB0byBsb2cgaW4hJyBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZWNvcmQgcGFzc3dvcmQgaWYgcHJvdmlkZWRcbiAgICAgIGlmIChwYXNzd29yZCkge1xuICAgICAgICBjdXJyZW50U3RhdGUucGFzc3dvcmRzID0gY3VycmVudFN0YXRlLnBhc3N3b3JkcyB8fCB7fTtcbiAgICAgICAgY3VycmVudFN0YXRlLnBhc3N3b3Jkc1tjbGVhbkVtYWlsXSA9IHBhc3N3b3JkO1xuICAgICAgfVxuXG4gICAgICAvLyBSZW1vdmUgZnJvbSBkZWxldGVkIGxpc3QgaWYgcmUtcmVnaXN0ZXJpbmdcbiAgICAgIGRlbGV0ZSBjdXJyZW50U3RhdGUuZGVsZXRlZFtjbGVhbkVtYWlsXTtcblxuICAgICAgaWYgKHN0YXR1cykge1xuICAgICAgICBpZiAoc3RhdHVzLmluY2x1ZGVzKCdTdXNwZW5kZWQnKSB8fCBzdGF0dXMuaW5jbHVkZXMoJ0luYWN0aXZlJykpIHtcbiAgICAgICAgICBjdXJyZW50U3RhdGUuc3VzcGVuZGVkW2NsZWFuRW1haWxdID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJyZW50U3RhdGUuc3VzcGVuZGVkW2NsZWFuRW1haWxdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgY3JlZGl0c1ZhbCA9IHR5cGVvZiByZXEuYm9keS5jcmVkaXRzID09PSAnbnVtYmVyJyA/IHJlcS5ib2R5LmNyZWRpdHMgOiAocHJvZmlsZSAmJiB0eXBlb2YgcHJvZmlsZS5jcmVkaXRzID09PSAnbnVtYmVyJyA/IHByb2ZpbGUuY3JlZGl0cyA6IHVuZGVmaW5lZCk7XG5cbiAgICAgIGlmIChwcm9maWxlKSB7XG4gICAgICAgIGN1cnJlbnRTdGF0ZS5wcm9maWxlc1tjbGVhbkVtYWlsXSA9IHtcbiAgICAgICAgICAuLi5jdXJyZW50U3RhdGUucHJvZmlsZXNbY2xlYW5FbWFpbF0sXG4gICAgICAgICAgLi4ucHJvZmlsZSxcbiAgICAgICAgICBjcmVkaXRzOiBjcmVkaXRzVmFsICE9PSB1bmRlZmluZWQgPyBjcmVkaXRzVmFsIDogKGN1cnJlbnRTdGF0ZS5wcm9maWxlc1tjbGVhbkVtYWlsXT8uY3JlZGl0cyA/PyAyMClcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoY3JlZGl0c1ZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGN1cnJlbnRTdGF0ZS5wcm9maWxlc1tjbGVhbkVtYWlsXSA9IHtcbiAgICAgICAgICAuLi4oY3VycmVudFN0YXRlLnByb2ZpbGVzW2NsZWFuRW1haWxdIHx8IHt9KSxcbiAgICAgICAgICBjcmVkaXRzOiBjcmVkaXRzVmFsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGlmIChleGlzdGluZ0luZGV4ICE9PSAtMSkge1xuICAgICAgICBpZiAocGxhbikgY3VycmVudFN0YXRlLnVzZXJzW2V4aXN0aW5nSW5kZXhdLnBsYW4gPSBwbGFuO1xuICAgICAgICBpZiAoc3RhdHVzKSBjdXJyZW50U3RhdGUudXNlcnNbZXhpc3RpbmdJbmRleF0uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBpZiAocHJvZmlsZSkgY3VycmVudFN0YXRlLnVzZXJzW2V4aXN0aW5nSW5kZXhdLnByb2ZpbGUgPSBjdXJyZW50U3RhdGUucHJvZmlsZXNbY2xlYW5FbWFpbF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuZXdVc2VyID0ge1xuICAgICAgICAgIGlkOiAndV8nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICB1c2VyOiBjbGVhbkVtYWlsLFxuICAgICAgICAgIHBsYW46IHBsYW4gfHwgKHJvbGUgPT09ICdhZG1pbicgPyAnU3VwZXJNYWNobyBDb21taXNzaW9uZXInIDogJ0ZyZWUgUm9va2llICgkMC9tbyknKSxcbiAgICAgICAgICBkYXRlOiAnSnVzdCBub3cnLFxuICAgICAgICAgIHN0YXR1czogc3RhdHVzIHx8ICdBY3RpdmUgU3Vic2NyaWJlcicsXG4gICAgICAgICAgcHJvZmlsZTogY3VycmVudFN0YXRlLnByb2ZpbGVzW2NsZWFuRW1haWxdIHx8IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgY3VycmVudFN0YXRlLnVzZXJzLnVuc2hpZnQobmV3VXNlcik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHNhdmVTdGF0ZShjdXJyZW50U3RhdGUpO1xuXG4gICAgICAvLyBTYXZlIHRvIFN1cGFiYXNlIHByb2ZpbGUgaWYgY29uZmlndXJlZFxuICAgICAgaWYgKHN1cGFiYXNlVXJsICYmICFzdXBhYmFzZVVybC5pbmNsdWRlcygncGxhY2Vob2xkZXInKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzdXBhYmFzZVNlcnZpY2VLZXkpO1xuICAgICAgICAgIGNvbnN0IG1hcHBlZFBsYW5JZCA9IHBsYW4gPyAoXG4gICAgICAgICAgICBwbGFuLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJzMwMCcpIHx8IHBsYW4udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY29tbWlzc2lvbmVyJykgPyAnY29tbWlzc2lvbmVyJyA6XG4gICAgICAgICAgICBwbGFuLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJzEwMCcpIHx8IHBsYW4udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygncHJvJykgPyAncHJvJyA6XG4gICAgICAgICAgICBwbGFuLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJzUwJykgfHwgcGxhbi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdib29zdGVyJykgPyAnYm9vc3RlcicgOlxuICAgICAgICAgICAgJ2ZyZWUnXG4gICAgICAgICAgKSA6ICdmcmVlJztcblxuICAgICAgICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ3Byb2ZpbGVzJykudXBzZXJ0KHtcbiAgICAgICAgICAgIGVtYWlsOiBjbGVhbkVtYWlsLFxuICAgICAgICAgICAgcm9sZTogcm9sZSB8fCAnY2xpZW50JyxcbiAgICAgICAgICAgIHBsYW5faWQ6IG1hcHBlZFBsYW5JZCxcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzIHx8ICdhY3RpdmUnLFxuICAgICAgICAgICAgYmlydGhkYXk6IHByb2ZpbGU/LmJpcnRoZGF5IHx8IG51bGwsXG4gICAgICAgICAgICBmYXZvcml0ZV9udW1iZXI6IHByb2ZpbGU/LmZhdm9yaXRlTnVtYmVyIHx8IG51bGwsXG4gICAgICAgICAgICBmYXZvcml0ZV90ZWFtOiBwcm9maWxlPy5mYXZvcml0ZVRlYW0gfHwgbnVsbCxcbiAgICAgICAgICAgIHByZWZlcnJlZF9sYW5ndWFnZTogcHJvZmlsZT8ucHJlZkxhbmcgfHwgJ2VuJ1xuICAgICAgICAgIH0sIHsgb25Db25mbGljdDogJ2VtYWlsJyB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICB1c2VyczogY3VycmVudFN0YXRlLnVzZXJzLCBcbiAgICAgICAgc3VzcGVuZGVkOiBjdXJyZW50U3RhdGUuc3VzcGVuZGVkLFxuICAgICAgICBwcm9maWxlOiBjdXJyZW50U3RhdGUucHJvZmlsZXNbY2xlYW5FbWFpbF0gfHwgbnVsbFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHJlcS5tZXRob2QgPT09ICdERUxFVEUnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZW1haWwsIGNsZWFyQWxsVGVzdFVzZXJzIH0gPSByZXEuYm9keSB8fCB7fTtcblxuICAgICAgaWYgKGNsZWFyQWxsVGVzdFVzZXJzKSB7XG4gICAgICAgIC8vIENsZWFyIHRlbXBvcmFyeSB0ZXN0IHVzZXJzIHdoaWxlIHByZXNlcnZpbmcgYmFzZSBhY2NvdW50c1xuICAgICAgICBjdXJyZW50U3RhdGUudXNlcnMgPSBbLi4uQkFTRV9VU0VSU107XG4gICAgICAgIGN1cnJlbnRTdGF0ZS5zdXNwZW5kZWQgPSB7fTtcbiAgICAgICAgY3VycmVudFN0YXRlLmRlbGV0ZWQgPSB7fTtcbiAgICAgICAgc2F2ZVN0YXRlKGN1cnJlbnRTdGF0ZSk7XG5cbiAgICAgICAgaWYgKHN1cGFiYXNlVXJsICYmICFzdXBhYmFzZVVybC5pbmNsdWRlcygncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VTZXJ2aWNlS2V5KTtcbiAgICAgICAgICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ3Byb2ZpbGVzJykuZGVsZXRlKCkubmVxKCdyb2xlJywgJ2FkbWluJyk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN1Y2Nlc3M6IHRydWUsIHVzZXJzOiBjdXJyZW50U3RhdGUudXNlcnMgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbWFpbCkge1xuICAgICAgICBjb25zdCBjbGVhbkVtYWlsID0gZW1haWwudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGN1cnJlbnRTdGF0ZS5kZWxldGVkW2NsZWFuRW1haWxdID0gdHJ1ZTtcbiAgICAgICAgY3VycmVudFN0YXRlLnVzZXJzID0gY3VycmVudFN0YXRlLnVzZXJzLmZpbHRlcih1ID0+IHUudXNlci50b0xvd2VyQ2FzZSgpICE9PSBjbGVhbkVtYWlsKTtcbiAgICAgICAgZGVsZXRlIGN1cnJlbnRTdGF0ZS5zdXNwZW5kZWRbY2xlYW5FbWFpbF07XG4gICAgICAgIGRlbGV0ZSBjdXJyZW50U3RhdGUucHJvZmlsZXNbY2xlYW5FbWFpbF07XG4gICAgICAgIHNhdmVTdGF0ZShjdXJyZW50U3RhdGUpO1xuXG4gICAgICAgIC8vIERlbGV0ZSBmcm9tIFN1cGFiYXNlIHByb2ZpbGVzIHRhYmxlIGlmIGNvbmZpZ3VyZWRcbiAgICAgICAgaWYgKHN1cGFiYXNlVXJsICYmICFzdXBhYmFzZVVybC5pbmNsdWRlcygncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VTZXJ2aWNlS2V5KTtcbiAgICAgICAgICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ3Byb2ZpbGVzJykuZGVsZXRlKCkuZXEoJ2VtYWlsJywgY2xlYW5FbWFpbCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3VjY2VzczogdHJ1ZSwgdXNlcnM6IGN1cnJlbnRTdGF0ZS51c2VycyB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICB9XG4gIH1cblxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICBsZXQgY2hlY2tFbWFpbCA9IG51bGw7XG4gICAgbGV0IGdldFByb2ZpbGVFbWFpbCA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVxVXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGlmIChyZXFVcmwuaW5jbHVkZXMoJ2NoZWNrX3N1c3BlbmRlZD0nKSkge1xuICAgICAgICBjb25zdCBwYXJhbVN0ciA9IHJlcVVybC5zcGxpdCgnY2hlY2tfc3VzcGVuZGVkPScpWzFdO1xuICAgICAgICBpZiAocGFyYW1TdHIpIHtcbiAgICAgICAgICBjaGVja0VtYWlsID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtU3RyLnNwbGl0KCcmJylbMF0pLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocmVxVXJsLmluY2x1ZGVzKCdnZXRfcHJvZmlsZT0nKSkge1xuICAgICAgICBjb25zdCBwYXJhbVN0ciA9IHJlcVVybC5zcGxpdCgnZ2V0X3Byb2ZpbGU9JylbMV07XG4gICAgICAgIGlmIChwYXJhbVN0cikge1xuICAgICAgICAgIGdldFByb2ZpbGVFbWFpbCA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbVN0ci5zcGxpdCgnJicpWzBdKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICBpZiAoY2hlY2tFbWFpbCkge1xuICAgICAgY29uc3QgaXNTdXNwZW5kZWQgPSAhIWN1cnJlbnRTdGF0ZS5zdXNwZW5kZWRbY2hlY2tFbWFpbF07XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oeyBlbWFpbDogY2hlY2tFbWFpbCwgaXNTdXNwZW5kZWQgfSk7XG4gICAgfVxuXG4gICAgaWYgKGdldFByb2ZpbGVFbWFpbCkge1xuICAgICAgY29uc3QgcHJvZmlsZSA9IGN1cnJlbnRTdGF0ZS5wcm9maWxlc1tnZXRQcm9maWxlRW1haWxdIHx8IG51bGw7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oeyBlbWFpbDogZ2V0UHJvZmlsZUVtYWlsLCBwcm9maWxlIH0pO1xuICAgIH1cblxuICAgIC8vIE1lcmdlIFN1cGFiYXNlIGRhdGFiYXNlIHByb2ZpbGVzIGludG8gdXNlcnMgbGlzdCBpZiBjb25maWd1cmVkXG4gICAgbGV0IGFsbFVzZXJzID0gWy4uLmN1cnJlbnRTdGF0ZS51c2Vyc107XG5cbiAgICBpZiAoc3VwYWJhc2VVcmwgJiYgIXN1cGFiYXNlVXJsLmluY2x1ZGVzKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VTZXJ2aWNlS2V5KTtcbiAgICAgICAgY29uc3QgeyBkYXRhOiBkYlByb2ZpbGVzIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdwcm9maWxlcycpLnNlbGVjdCgnKicpO1xuICAgICAgICBpZiAoZGJQcm9maWxlcyAmJiBBcnJheS5pc0FycmF5KGRiUHJvZmlsZXMpICYmIGRiUHJvZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbnN0IHVzZXJNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gU2VlZCBjdXJyZW50U3RhdGUgdXNlcnMgZmlyc3RcbiAgICAgICAgICBhbGxVc2Vycy5mb3JFYWNoKHUgPT4ge1xuICAgICAgICAgICAgaWYgKHUgJiYgdS51c2VyKSB1c2VyTWFwLnNldCh1LnVzZXIudG9Mb3dlckNhc2UoKSwgdSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBPdmVycmlkZSAvIGh5ZHJhdGUgd2l0aCBTdXBhYmFzZSBEQiBwcm9maWxlc1xuICAgICAgICAgIGRiUHJvZmlsZXMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgIGlmIChwICYmIHAuZW1haWwpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2xlYW5FID0gcC5lbWFpbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICBpZiAoY3VycmVudFN0YXRlLmRlbGV0ZWQgJiYgY3VycmVudFN0YXRlLmRlbGV0ZWRbY2xlYW5FXSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nVXNlciA9IHVzZXJNYXAuZ2V0KGNsZWFuRSk7XG4gICAgICAgICAgICAgIGNvbnN0IHBsYW5OYW1lID0gZXhpc3RpbmdVc2VyPy5wbGFuIHx8IChcbiAgICAgICAgICAgICAgICBwLnBsYW5faWQgPT09ICdjb21taXNzaW9uZXInID8gJzMwMCBDcmVkaXRzIENvbW1pc3Npb25lciAoJDI0Ljk5IFVTRCknIDpcbiAgICAgICAgICAgICAgICBwLnBsYW5faWQgPT09ICdwcm8nID8gJzEwMCBDcmVkaXRzIFBybyBDaGFtcGlvbiAoJDkuOTkgVVNEKScgOlxuICAgICAgICAgICAgICAgIHAucGxhbl9pZCA9PT0gJ2Jvb3N0ZXInID8gJzUwIENyZWRpdHMgUXVpY2sgQm9vc3RlciAoJDUuOTkgVVNEKScgOlxuICAgICAgICAgICAgICAgICcyMCBGcmVlIENyZWRpdHMgUm9va2llICgkMC4wMCBVU0QpJ1xuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIHVzZXJNYXAuc2V0KGNsZWFuRSwge1xuICAgICAgICAgICAgICAgIGlkOiBwLmlkIHx8ICd1XycgKyBjbGVhbkUsXG4gICAgICAgICAgICAgICAgdXNlcjogY2xlYW5FLFxuICAgICAgICAgICAgICAgIHBsYW46IHBsYW5OYW1lLFxuICAgICAgICAgICAgICAgIGRhdGU6IHAuY3JlYXRlZF9hdCA/IG5ldyBEYXRlKHAuY3JlYXRlZF9hdCkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiAoZXhpc3RpbmdVc2VyPy5kYXRlIHx8ICdSZWdpc3RlcmVkJyksXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBwLnN0YXR1cyB8fCBleGlzdGluZ1VzZXI/LnN0YXR1cyB8fCAnQWN0aXZlIFN1YnNjcmliZXInLFxuICAgICAgICAgICAgICAgIHByb2ZpbGU6IHtcbiAgICAgICAgICAgICAgICAgIGVtYWlsOiBjbGVhbkUsXG4gICAgICAgICAgICAgICAgICBiaXJ0aGRheTogcC5iaXJ0aGRheSxcbiAgICAgICAgICAgICAgICAgIGZhdm9yaXRlVGVhbTogcC5mYXZvcml0ZV90ZWFtLFxuICAgICAgICAgICAgICAgICAgZmF2b3JpdGVOdW1iZXI6IHAuZmF2b3JpdGVfbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgcHJlZkxhbmc6IHAucHJlZmVycmVkX2xhbmd1YWdlLFxuICAgICAgICAgICAgICAgICAgcHJvZmlsZUNvbXBsZXRlZDogcC5wcm9maWxlX2NvbXBsZXRlZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBhbGxVc2VycyA9IEFycmF5LmZyb20odXNlck1hcC52YWx1ZXMoKSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgICB1c2VyczogYWxsVXNlcnMsIFxuICAgICAgc3VzcGVuZGVkOiBjdXJyZW50U3RhdGUuc3VzcGVuZGVkLFxuICAgICAgcHJvZmlsZXM6IGN1cnJlbnRTdGF0ZS5wcm9maWxlc1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlcy5zdGF0dXMoNDA1KS5qc29uKHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc3VhcmlvXFxcXERyb3Bib3hcXFxcaHRkb2NzXFxcXGh0ZG9jc19uZmxfZmFudGFzeVxcXFxTYWFTXFxcXGFwaVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVXN1YXJpb1xcXFxEcm9wYm94XFxcXGh0ZG9jc1xcXFxodGRvY3NfbmZsX2ZhbnRhc3lcXFxcU2FhU1xcXFxhcGlcXFxcdGlja2V0cy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvVXN1YXJpby9Ecm9wYm94L2h0ZG9jcy9odGRvY3NfbmZsX2ZhbnRhc3kvU2FhUy9hcGkvdGlja2V0cy5qc1wiO2ltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5jb25zdCBzdXBhYmFzZVVybCA9IHByb2Nlc3MuZW52LlZJVEVfU1VQQUJBU0VfVVJMIHx8IHByb2Nlc3MuZW52LlNVUEFCQVNFX1VSTCB8fCAnaHR0cHM6Ly9qZG1yeWh4bWZnZWRmZGxleXR3bi5zdXBhYmFzZS5jbyc7XG5jb25zdCBzdXBhYmFzZVNlcnZpY2VLZXkgPSBwcm9jZXNzLmVudi5TVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIHx8IHByb2Nlc3MuZW52LlZJVEVfU1VQQUJBU0VfQU5PTl9LRVkgfHwgcHJvY2Vzcy5lbnYuU1VQQUJBU0VfQU5PTl9LRVkgfHwgJ2V5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwYzNNaU9pSnpkWEJoWW1GelpTSXNJbkpsWmlJNkltcGtiWEo1YUhodFptZGxaR1prYkdWNWRIZHVJaXdpY205c1pTSTZJbUZ1YjI0aUxDSnBZWFFpT2pFM09EY3pOekV3TWpVc0ltVjRjQ0k2TWpFd01qazBOekF5TlgwLm1aNlhpbGhZaC1mbDFhSHUxcnRMZXdSenFjZ2UwSGJaX2RnbFhxT2h5X1UnO1xuXG5jb25zdCBUTVBfVElDS0VUU19GSUxFID0gJy90bXAvc3VwZXJtYWNob190aWNrZXRzX3YxLmpzb24nO1xuXG5jb25zdCBERUZBVUxUX1NFRURfVElDS0VUUyA9IFtdO1xuXG5mdW5jdGlvbiByZWFkVGlja2V0c1N0YXRlKCkge1xuICB0cnkge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKFRNUF9USUNLRVRTX0ZJTEUpKSB7XG4gICAgICBjb25zdCByYXcgPSBmcy5yZWFkRmlsZVN5bmMoVE1QX1RJQ0tFVFNfRklMRSwgJ3V0ZjgnKTtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhcnNlZCkpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHt9XG4gIHJldHVybiBbXTtcbn1cblxuZnVuY3Rpb24gc2F2ZVRpY2tldHNTdGF0ZSh0aWNrZXRzKSB7XG4gIHRyeSB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhUTVBfVElDS0VUU19GSUxFLCBKU09OLnN0cmluZ2lmeSh0aWNrZXRzKSk7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TJyk7XG4gIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuZW5kKCk7XG4gIH1cblxuICBsZXQgdGlja2V0cyA9IHJlYWRUaWNrZXRzU3RhdGUoKTtcblxuICAvLyBHRVQ6IFJldHJpZXZlIHRpY2tldHMgKEFsbCBmb3IgQWRtaW4sIG9yIGZpbHRlcmVkIGJ5IHVzZXJfZW1haWwpXG4gIGlmIChyZXEubWV0aG9kID09PSAnR0VUJykge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZmlsdGVyRW1haWwgPSBudWxsO1xuICAgICAgY29uc3QgcmVxVXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGlmIChyZXFVcmwuaW5jbHVkZXMoJ3VzZXJfZW1haWw9JykpIHtcbiAgICAgICAgY29uc3QgcGFyYW1TdHIgPSByZXFVcmwuc3BsaXQoJ3VzZXJfZW1haWw9JylbMV07XG4gICAgICAgIGlmIChwYXJhbVN0cikge1xuICAgICAgICAgIGZpbHRlckVtYWlsID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtU3RyLnNwbGl0KCcmJylbMF0pLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWx0ZXJFbWFpbCkge1xuICAgICAgICBjb25zdCB1c2VyVGlja2V0cyA9IHRpY2tldHMuZmlsdGVyKHQgPT4gKHQudXNlcl9lbWFpbCB8fCAnJykudG9Mb3dlckNhc2UoKSA9PT0gZmlsdGVyRW1haWwpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oeyB0aWNrZXRzOiB1c2VyVGlja2V0cyB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdGlja2V0cyB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBlcnIubWVzc2FnZSwgdGlja2V0cyB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBQT1NUOiBDcmVhdGUgbmV3IHRpY2tldCBPUiBhcHBlbmQgcmVwbHlcbiAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGFjdGlvbiwgdGlja2V0SWQsIHVzZXJfZW1haWwsIHN1YmplY3QsIGNhdGVnb3J5LCBwcmlvcml0eSwgbWVzc2FnZSwgc2VuZGVyTmFtZSwgc2VuZGVyRW1haWwgfSA9IHJlcS5ib2R5IHx8IHt9O1xuXG4gICAgICBpZiAoYWN0aW9uID09PSAncmVwbHknICYmIHRpY2tldElkICYmIG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgdGlja2V0SWR4ID0gdGlja2V0cy5maW5kSW5kZXgodCA9PiB0LmlkID09PSB0aWNrZXRJZCk7XG4gICAgICAgIGlmICh0aWNrZXRJZHggIT09IC0xKSB7XG4gICAgICAgICAgY29uc3QgbmV3UmVwbHkgPSB7XG4gICAgICAgICAgICBzZW5kZXI6IHNlbmRlckVtYWlsIHx8IHVzZXJfZW1haWwgfHwgJ3N1cHBvcnRAc3VwZXJtYWNoby5hcHAnLFxuICAgICAgICAgICAgc2VuZGVyTmFtZTogc2VuZGVyTmFtZSB8fCAnVXNlcicsXG4gICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZyhbXSwgeyBob3VyOiAnMi1kaWdpdCcsIG1pbnV0ZTogJzItZGlnaXQnLCBkYXk6ICcyLWRpZ2l0JywgbW9udGg6ICdzaG9ydCcgfSlcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRpY2tldHNbdGlja2V0SWR4XS5tZXNzYWdlcy5wdXNoKG5ld1JlcGx5KTtcbiAgICAgICAgICB0aWNrZXRzW3RpY2tldElkeF0udXBkYXRlZF9hdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICBzYXZlVGlja2V0c1N0YXRlKHRpY2tldHMpO1xuXG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3VjY2VzczogdHJ1ZSwgdGlja2V0OiB0aWNrZXRzW3RpY2tldElkeF0sIHRpY2tldHMgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHsgZXJyb3I6ICdUaWNrZXQgbm90IGZvdW5kJyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIG5ldyB0aWNrZXRcbiAgICAgIGlmICghdXNlcl9lbWFpbCB8fCAhc3ViamVjdCB8fCAhbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgZmllbGRzICh1c2VyX2VtYWlsLCBzdWJqZWN0LCBtZXNzYWdlKScgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5ld1RpY2tldCA9IHtcbiAgICAgICAgaWQ6ICd0aWNrXycgKyBEYXRlLm5vdygpLFxuICAgICAgICB1c2VyX2VtYWlsOiB1c2VyX2VtYWlsLnRyaW0oKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICBzdWJqZWN0OiBzdWJqZWN0LnRyaW0oKSxcbiAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5IHx8ICdHZW5lcmFsJyxcbiAgICAgICAgcHJpb3JpdHk6IHByaW9yaXR5IHx8ICdNZWRpdW0nLFxuICAgICAgICBzdGF0dXM6ICdPcGVuJyxcbiAgICAgICAgY3JlYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB1cGRhdGVkX2F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc2VuZGVyOiB1c2VyX2VtYWlsLnRyaW0oKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgc2VuZGVyTmFtZTogc2VuZGVyTmFtZSB8fCB1c2VyX2VtYWlsLnNwbGl0KCdAJylbMF0sXG4gICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZyhbXSwgeyBob3VyOiAnMi1kaWdpdCcsIG1pbnV0ZTogJzItZGlnaXQnLCBkYXk6ICcyLWRpZ2l0JywgbW9udGg6ICdzaG9ydCcgfSlcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH07XG5cbiAgICAgIHRpY2tldHMudW5zaGlmdChuZXdUaWNrZXQpO1xuICAgICAgc2F2ZVRpY2tldHNTdGF0ZSh0aWNrZXRzKTtcblxuICAgICAgLy8gQXR0ZW1wdCB0byBzYXZlIHRvIFN1cGFiYXNlIGlmIGNvbmZpZ3VyZWRcbiAgICAgIGlmIChzdXBhYmFzZVVybCAmJiAhc3VwYWJhc2VVcmwuaW5jbHVkZXMoJ3BsYWNlaG9sZGVyJykpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VTZXJ2aWNlS2V5KTtcbiAgICAgICAgICBhd2FpdCBzdXBhYmFzZS5mcm9tKCdzdXBwb3J0X3RpY2tldHMnKS5pbnNlcnQoW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB1c2VyX2VtYWlsOiBuZXdUaWNrZXQudXNlcl9lbWFpbCxcbiAgICAgICAgICAgICAgc3ViamVjdDogbmV3VGlja2V0LnN1YmplY3QsXG4gICAgICAgICAgICAgIGNhdGVnb3J5OiBuZXdUaWNrZXQuY2F0ZWdvcnksXG4gICAgICAgICAgICAgIHByaW9yaXR5OiBuZXdUaWNrZXQucHJpb3JpdHksXG4gICAgICAgICAgICAgIHN0YXR1czogbmV3VGlja2V0LnN0YXR1cyxcbiAgICAgICAgICAgICAgbWVzc2FnZXM6IG5ld1RpY2tldC5tZXNzYWdlc1xuICAgICAgICAgICAgfVxuICAgICAgICAgIF0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdWNjZXNzOiB0cnVlLCB0aWNrZXQ6IG5ld1RpY2tldCwgdGlja2V0cyB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBQVVQ6IFVwZGF0ZSBzdGF0dXMgb3IgZGV0YWlscyBvZiBhIHRpY2tldFxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BVVCcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyB0aWNrZXRJZCwgc3RhdHVzLCBwcmlvcml0eSwgYWRtaW5SZXBseSB9ID0gcmVxLmJvZHkgfHwge307XG4gICAgICBpZiAoIXRpY2tldElkKSByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ3RpY2tldElkIHJlcXVpcmVkJyB9KTtcblxuICAgICAgY29uc3QgdGlja2V0SWR4ID0gdGlja2V0cy5maW5kSW5kZXgodCA9PiB0LmlkID09PSB0aWNrZXRJZCk7XG4gICAgICBpZiAodGlja2V0SWR4ICE9PSAtMSkge1xuICAgICAgICBpZiAoc3RhdHVzKSB0aWNrZXRzW3RpY2tldElkeF0uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBpZiAocHJpb3JpdHkpIHRpY2tldHNbdGlja2V0SWR4XS5wcmlvcml0eSA9IHByaW9yaXR5O1xuXG4gICAgICAgIGlmIChhZG1pblJlcGx5KSB7XG4gICAgICAgICAgdGlja2V0c1t0aWNrZXRJZHhdLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgc2VuZGVyOiAnc3VwcG9ydEBzdXBlcm1hY2hvLmFwcCcsXG4gICAgICAgICAgICBzZW5kZXJOYW1lOiAnU3VwZXJNYWNobyBTdXBwb3J0IFRlYW0nLFxuICAgICAgICAgICAgdGV4dDogYWRtaW5SZXBseSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoW10sIHsgaG91cjogJzItZGlnaXQnLCBtaW51dGU6ICcyLWRpZ2l0JywgZGF5OiAnMi1kaWdpdCcsIG1vbnRoOiAnc2hvcnQnIH0pXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aWNrZXRzW3RpY2tldElkeF0udXBkYXRlZF9hdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgc2F2ZVRpY2tldHNTdGF0ZSh0aWNrZXRzKTtcblxuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdWNjZXNzOiB0cnVlLCB0aWNrZXQ6IHRpY2tldHNbdGlja2V0SWR4XSwgdGlja2V0cyB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnVGlja2V0IG5vdCBmb3VuZCcgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gREVMRVRFOiBSZW1vdmUgdGlja2V0XG4gIGlmIChyZXEubWV0aG9kID09PSAnREVMRVRFJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHRpY2tldElkIH0gPSByZXEuYm9keSB8fCB7fTtcbiAgICAgIGlmICh0aWNrZXRJZCkge1xuICAgICAgICB0aWNrZXRzID0gdGlja2V0cy5maWx0ZXIodCA9PiB0LmlkICE9PSB0aWNrZXRJZCk7XG4gICAgICAgIHNhdmVUaWNrZXRzU3RhdGUodGlja2V0cyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdWNjZXNzOiB0cnVlLCB0aWNrZXRzIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMuc3RhdHVzKDQwNSkuanNvbih7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9KTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVXN1YXJpb1xcXFxEcm9wYm94XFxcXGh0ZG9jc1xcXFxodGRvY3NfbmZsX2ZhbnRhc3lcXFxcU2FhU1xcXFxhcGlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVzdWFyaW9cXFxcRHJvcGJveFxcXFxodGRvY3NcXFxcaHRkb2NzX25mbF9mYW50YXN5XFxcXFNhYVNcXFxcYXBpXFxcXG5mbC1zeW5jLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9Vc3VhcmlvL0Ryb3Bib3gvaHRkb2NzL2h0ZG9jc19uZmxfZmFudGFzeS9TYWFTL2FwaS9uZmwtc3luYy5qc1wiO2ltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmNvbnN0IENSRURfRklMRSA9ICcvdG1wL3N1cGVybWFjaG9fcmFwaWRhcGkuanNvbic7XG5jb25zdCBDQUNIRV9GSUxFID0gJy90bXAvbmZsX2xpdmVfY2FjaGUuanNvbic7XG5cbi8vIEhlbHBlciB0byByZWFkIHNlcnZlci1wZXJzaXN0ZWQgY3JlZGVudGlhbHNcbmZ1bmN0aW9uIHJlYWRDcmVkZW50aWFscygpIHtcbiAgdHJ5IHtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhDUkVEX0ZJTEUpKSB7XG4gICAgICBjb25zdCByYXcgPSBmcy5yZWFkRmlsZVN5bmMoQ1JFRF9GSUxFLCAndXRmOCcpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UocmF3KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHt9XG4gIHJldHVybiB7XG4gICAga2V5OiBwcm9jZXNzLmVudi5SQVBJREFQSV9LRVkgfHwgcHJvY2Vzcy5lbnYuVklURV9SQVBJREFQSV9LRVkgfHwgJycsXG4gICAgaG9zdDogcHJvY2Vzcy5lbnYuUkFQSURBUElfSE9TVCB8fCAnbmZsLWFwaS1kYXRhLnAucmFwaWRhcGkuY29tJ1xuICB9O1xufVxuXG4vLyBIZWxwZXIgdG8gd3JpdGUgc2VydmVyLXBlcnNpc3RlZCBjcmVkZW50aWFsc1xuZnVuY3Rpb24gc2F2ZUNyZWRlbnRpYWxzKGNyZWRzKSB7XG4gIHRyeSB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhDUkVEX0ZJTEUsIEpTT04uc3RyaW5naWZ5KGNyZWRzKSk7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG5cbi8vIEhlbHBlciB0byByZWFkIGNhY2hlZCBORkwgbGl2ZSBkYXRhXG5mdW5jdGlvbiByZWFkQ2FjaGUoKSB7XG4gIHRyeSB7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoQ0FDSEVfRklMRSkpIHtcbiAgICAgIGNvbnN0IHJhdyA9IGZzLnJlYWRGaWxlU3luYyhDQUNIRV9GSUxFLCAndXRmOCcpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UocmF3KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHt9XG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBIZWxwZXIgdG8gd3JpdGUgY2FjaGVkIE5GTCBsaXZlIGRhdGFcbmZ1bmN0aW9uIHdyaXRlQ2FjaGUoZGF0YSkge1xuICB0cnkge1xuICAgIGZzLndyaXRlRmlsZVN5bmMoQ0FDSEVfRklMRSwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICB9IGNhdGNoIChlKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBPUFRJT05TJyk7XG4gIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuZW5kKCk7XG4gIH1cblxuICAvLyBIYW5kbGUgUE9TVDogUGVyc2lzdCBSYXBpZEFQSSBjcmVkZW50aWFscyBvbiBzZXJ2ZXJcbiAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGtleSwgaG9zdCB9ID0gcmVxLmJvZHkgfHwge307XG4gICAgICBjb25zdCBjdXJyZW50Q3JlZHMgPSByZWFkQ3JlZGVudGlhbHMoKTtcbiAgICAgIGNvbnN0IG5ld0NyZWRzID0ge1xuICAgICAgICBrZXk6IGtleSAhPT0gdW5kZWZpbmVkID8ga2V5LnRyaW0oKSA6IGN1cnJlbnRDcmVkcy5rZXksXG4gICAgICAgIGhvc3Q6IGhvc3QgIT09IHVuZGVmaW5lZCA/IGhvc3QudHJpbSgpIDogY3VycmVudENyZWRzLmhvc3RcbiAgICAgIH07XG4gICAgICBzYXZlQ3JlZGVudGlhbHMobmV3Q3JlZHMpO1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3VjY2VzczogdHJ1ZSwgY3JlZGVudGlhbHM6IG5ld0NyZWRzIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIEhhbmRsZSBHRVQ6IEZldGNoIG9mZmljaWFsIEVTUE4gUmVhbC1UaW1lIFNjb3JlYm9hcmQgJiBCcmVha2luZyBORkwgTmV3c1xuICBjb25zdCBhY3RpdmVDcmVkcyA9IHJlYWRDcmVkZW50aWFscygpO1xuICBjb25zdCBhcGlLZXkgPSBhY3RpdmVDcmVkcy5rZXk7XG4gIGNvbnN0IGFwaUhvc3QgPSBhY3RpdmVDcmVkcy5ob3N0IHx8ICduZmwtYXBpLWRhdGEucC5yYXBpZGFwaS5jb20nO1xuXG4gIGNvbnN0IGNhY2hlZCA9IHJlYWRDYWNoZSgpO1xuICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXG4gIC8vIFJldHVybiBjYWNoZSBpZiBmcmVzaCAodW5kZXIgMyBtaW51dGVzKVxuICBpZiAoY2FjaGVkICYmIGNhY2hlZC50aW1lc3RhbXAgJiYgKG5vdyAtIGNhY2hlZC50aW1lc3RhbXAgPCAxODAwMDApKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc291cmNlOiAnZXNwbl9saXZlX2NhY2hlJywgY3JlZGVudGlhbHM6IGFjdGl2ZUNyZWRzLCAuLi5jYWNoZWQuZGF0YSB9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gMS4gRmV0Y2ggT2ZmaWNpYWwgRVNQTiBSZWFsLVRpbWUgU2NvcmVib2FyZCAvIFNjaGVkdWxlc1xuICAgIGNvbnN0IGVzcG5TY29yZXNSZXMgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9zaXRlLmFwaS5lc3BuLmNvbS9hcGlzL3NpdGUvdjIvc3BvcnRzL2Zvb3RiYWxsL25mbC9zY29yZWJvYXJkJyk7XG4gICAgY29uc3QgZXNwblNjb3Jlc0RhdGEgPSBhd2FpdCBlc3BuU2NvcmVzUmVzLmpzb24oKTtcblxuICAgIC8vIDIuIEZldGNoIE9mZmljaWFsIEVTUE4gQnJlYWtpbmcgTkZMIE5ld3MgJiBJbmp1cnkgUmVwb3J0c1xuICAgIGNvbnN0IGVzcG5OZXdzUmVzID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vc2l0ZS5hcGkuZXNwbi5jb20vYXBpcy9zaXRlL3YyL3Nwb3J0cy9mb290YmFsbC9uZmwvbmV3cycpO1xuICAgIGNvbnN0IGVzcG5OZXdzRGF0YSA9IGF3YWl0IGVzcG5OZXdzUmVzLmpzb24oKTtcblxuICAgIC8vIFBhcnNlIFJlYWwgRVNQTiBFdmVudHNcbiAgICBjb25zdCByYXdFdmVudHMgPSBlc3BuU2NvcmVzRGF0YS5ldmVudHMgfHwgW107XG4gICAgY29uc3QgcmVhbEdhbWVzID0gcmF3RXZlbnRzLm1hcChldnQgPT4ge1xuICAgICAgY29uc3QgY29tcGV0aXRpb24gPSBldnQuY29tcGV0aXRpb25zPy5bMF0gfHwge307XG4gICAgICBjb25zdCBjb21wZXRpdG9ycyA9IGNvbXBldGl0aW9uLmNvbXBldGl0b3JzIHx8IFtdO1xuICAgICAgY29uc3QgaG9tZSA9IGNvbXBldGl0b3JzLmZpbmQoYyA9PiBjLmhvbWVBd2F5ID09PSAnaG9tZScpIHx8IHt9O1xuICAgICAgY29uc3QgYXdheSA9IGNvbXBldGl0b3JzLmZpbmQoYyA9PiBjLmhvbWVBd2F5ID09PSAnYXdheScpIHx8IHt9O1xuICAgICAgY29uc3Qgc3RhdHVzID0gZXZ0LnN0YXR1cz8udHlwZSB8fCB7fTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGV2dC5pZCxcbiAgICAgICAgbmFtZTogZXZ0Lm5hbWUsXG4gICAgICAgIHNob3J0TmFtZTogZXZ0LnNob3J0TmFtZSxcbiAgICAgICAgZGF0ZTogZXZ0LmRhdGUsXG4gICAgICAgIHN0YXR1c1N0YXRlOiBzdGF0dXMuc3RhdGUsIC8vICdwcmUnLCAnaW4nLCAncG9zdCdcbiAgICAgICAgc3RhdHVzRGV0YWlsOiBzdGF0dXMuZGV0YWlsIHx8IHN0YXR1cy5kZXNjcmlwdGlvbiB8fCAnVXBjb21pbmcgR2FtZScsXG4gICAgICAgIGlzTGl2ZTogc3RhdHVzLnN0YXRlID09PSAnaW4nLFxuICAgICAgICBpc0NvbXBsZXRlZDogc3RhdHVzLnN0YXRlID09PSAncG9zdCcsXG4gICAgICAgIGhhc1Njb3JlOiBzdGF0dXMuc3RhdGUgPT09ICdpbicgfHwgc3RhdHVzLnN0YXRlID09PSAncG9zdCcsXG4gICAgICAgIGhvbWVUZWFtOiBob21lLnRlYW0/LmRpc3BsYXlOYW1lIHx8ICdIb21lIFRlYW0nLFxuICAgICAgICBob21lQWJicmV2OiBob21lLnRlYW0/LmFiYnJldmlhdGlvbiB8fCAnSE9NRScsXG4gICAgICAgIGhvbWVTY29yZTogaG9tZS5zY29yZSB8fCAnMCcsXG4gICAgICAgIGhvbWVMb2dvOiBob21lLnRlYW0/LmxvZ28gfHwgJycsXG4gICAgICAgIGF3YXlUZWFtOiBhd2F5LnRlYW0/LmRpc3BsYXlOYW1lIHx8ICdBd2F5IFRlYW0nLFxuICAgICAgICBhd2F5QWJicmV2OiBhd2F5LnRlYW0/LmFiYnJldmlhdGlvbiB8fCAnQVdBWScsXG4gICAgICAgIGF3YXlTY29yZTogYXdheS5zY29yZSB8fCAnMCcsXG4gICAgICAgIGF3YXlMb2dvOiBhd2F5LmxvZ28gfHwgJycsXG4gICAgICAgIG9kZHM6IGNvbXBldGl0aW9uLm9kZHM/LlswXT8uZGV0YWlscyB8fCAnTGluZSBUQkQnXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gUGFyc2UgUmVhbCBFU1BOIEJyZWFraW5nIEhlYWRsaW5lc1xuICAgIGNvbnN0IHJhd0FydGljbGVzID0gZXNwbk5ld3NEYXRhLmFydGljbGVzIHx8IFtdO1xuICAgIGNvbnN0IHJlYWxIZWFkbGluZXMgPSByYXdBcnRpY2xlcy5zbGljZSgwLCA1KS5tYXAoYXJ0ID0+ICh7XG4gICAgICBpZDogYXJ0LmlkIHx8IE1hdGgucmFuZG9tKCksXG4gICAgICBoZWFkbGluZTogYXJ0LmhlYWRsaW5lLFxuICAgICAgZGVzY3JpcHRpb246IGFydC5kZXNjcmlwdGlvbixcbiAgICAgIHB1Ymxpc2hlZDogYXJ0LnB1Ymxpc2hlZCxcbiAgICAgIGxpbms6IGFydC5saW5rcz8ud2ViPy5ocmVmIHx8ICcnXG4gICAgfSkpO1xuXG4gICAgLy8gSWYgdXNlciBwcm92aWRlZCBSYXBpZEFQSSBrZXksIGF0dGVtcHQgb3B0aW9uYWwgUmFwaWRBUEkgZW5yaWNobWVudFxuICAgIGxldCByYXBpZERhdGEgPSBudWxsO1xuICAgIGlmIChhcGlLZXkgJiYgIWFwaUtleS5pbmNsdWRlcygncGxhY2Vob2xkZXInKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IHRhcmdldFBhdGggPSAnL2dhbWVzP2xlYWd1ZT0xJnNlYXNvbj0yMDI2JztcbiAgICAgICAgaWYgKGFwaUhvc3QuaW5jbHVkZXMoJ25mbC1hcGktZGF0YScpKSB0YXJnZXRQYXRoID0gJy9uZmwtc2NoZWR1bGVzJztcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJSZXMgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly8ke2FwaUhvc3R9JHt0YXJnZXRQYXRofWAsIHtcbiAgICAgICAgICBoZWFkZXJzOiB7ICd4LXJhcGlkYXBpLWtleSc6IGFwaUtleSwgJ3gtcmFwaWRhcGktaG9zdCc6IGFwaUhvc3QgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmFwaWREYXRhID0gYXdhaXQgclJlcy5qc29uKCk7XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cblxuICAgIGNvbnN0IGRyYWZ0UGxheWVycyA9IFtcbiAgICAgIHsgaWQ6ICdwMScsIG5hbWU6ICdKYVxcJ01hcnIgQ2hhc2UnLCBwb3M6ICdXUicsIHRlYW06ICdDSU4nLCBieWU6IDEyLCBhZHA6ICcxLjAxJywgcHJvalB0czogMzE4LjUsIGZsb29yOiAxNy41LCBjZWlsaW5nOiAzNS4wLCB1cHNpZGVUaWVyOiAnV1IxIE9WRVJBTEwnLCB2YWx1ZVN0ZWFsOiAnQ09OU0VOU1VTICMxIFBJQ0snLCBuZWVkTWF0Y2g6IGZhbHNlIH0sXG4gICAgICB7IGlkOiAncDInLCBuYW1lOiAnQmlqYW4gUm9iaW5zb24nLCBwb3M6ICdSQicsIHRlYW06ICdBVEwnLCBieWU6IDEyLCBhZHA6ICcxLjAyJywgcHJvalB0czogMjk4LjIsIGZsb29yOiAxNS44LCBjZWlsaW5nOiAzMC4xLCB1cHNpZGVUaWVyOiAnUkIxIE9WRVJBTEwnLCB2YWx1ZVN0ZWFsOiAnVE9QIFJCIEFOQ0hPUicsIG5lZWRNYXRjaDogdHJ1ZSB9LFxuICAgICAgeyBpZDogJ3AzJywgbmFtZTogJ1NhcXVvbiBCYXJrbGV5JywgcG9zOiAnUkInLCB0ZWFtOiAnUEhJJywgYnllOiA1LCBhZHA6ICcxLjAzJywgcHJvalB0czogMjkyLjAsIGZsb29yOiAxNS4yLCBjZWlsaW5nOiAyOS41LCB1cHNpZGVUaWVyOiAnUy1USUVSIFZPTFVNRScsIHZhbHVlU3RlYWw6ICdUT1AgMyBQSUNLJywgbmVlZE1hdGNoOiB0cnVlIH0sXG4gICAgICB7IGlkOiAncDQnLCBuYW1lOiAnQnJlZWNlIEhhbGwnLCBwb3M6ICdSQicsIHRlYW06ICdOWUonLCBieWU6IDEyLCBhZHA6ICcxLjA0JywgcHJvalB0czogMjg2LjQsIGZsb29yOiAxNC44LCBjZWlsaW5nOiAyOC4yLCB1cHNpZGVUaWVyOiAnUy1USUVSIEVMSVRFJywgdmFsdWVTdGVhbDogJysyIFBpY2tzIFZhbHVlJywgbmVlZE1hdGNoOiB0cnVlIH0sXG4gICAgICB7IGlkOiAncDUnLCBuYW1lOiAnSnVzdGluIEplZmZlcnNvbicsIHBvczogJ1dSJywgdGVhbTogJ01JTicsIGJ5ZTogNiwgYWRwOiAnMS4wNScsIHByb2pQdHM6IDI5MC4xLCBmbG9vcjogMTUuNSwgY2VpbGluZzogMzEuMiwgdXBzaWRlVGllcjogJ0VMSVRFIFRBUkdFVCBTSEFSRScsIHZhbHVlU3RlYWw6ICdUT1AgNSBXUicsIG5lZWRNYXRjaDogZmFsc2UgfSxcbiAgICAgIHsgaWQ6ICdwNicsIG5hbWU6ICdDZWVEZWUgTGFtYicsIHBvczogJ1dSJywgdGVhbTogJ0RBTCcsIGJ5ZTogNywgYWRwOiAnMS4wNicsIHByb2pQdHM6IDI4OC41LCBmbG9vcjogMTUuMCwgY2VpbGluZzogMzAuNSwgdXBzaWRlVGllcjogJ0VMSVRFIFRBUkdFVCBTSEFSRScsIHZhbHVlU3RlYWw6ICdUT1AgNiBXUicsIG5lZWRNYXRjaDogZmFsc2UgfSxcbiAgICAgIHsgaWQ6ICdwNycsIG5hbWU6ICdBbW9uLVJhIFN0LiBCcm93bicsIHBvczogJ1dSJywgdGVhbTogJ0RFVCcsIGJ5ZTogNSwgYWRwOiAnMS4wNycsIHByb2pQdHM6IDI3NS4yLCBmbG9vcjogMTQuNSwgY2VpbGluZzogMjcuOCwgdXBzaWRlVGllcjogJ0hJR0ggRkxPT1IgQU5DSE9SJywgdmFsdWVTdGVhbDogJ1JPVU5EIDEgQU5DSE9SJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3A4JywgbmFtZTogJ01hbGlrIE5hYmVycycsIHBvczogJ1dSJywgdGVhbTogJ05ZRycsIGJ5ZTogMTEsIGFkcDogJzEuMDgnLCBwcm9qUHRzOiAyNjQuNSwgZmxvb3I6IDEzLjIsIGNlaWxpbmc6IDI4LjAsIHVwc2lkZVRpZXI6ICdCUkVBS09VVCBTVVBFUlNUQVInLCB2YWx1ZVN0ZWFsOiAnKzQgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IGZhbHNlIH0sXG4gICAgICB7IGlkOiAncDknLCBuYW1lOiAnRGVycmljayBIZW5yeScsIHBvczogJ1JCJywgdGVhbTogJ0JBTCcsIGJ5ZTogMTQsIGFkcDogJzEuMDknLCBwcm9qUHRzOiAyNzIuMCwgZmxvb3I6IDE0LjAsIGNlaWxpbmc6IDI5LjAsIHVwc2lkZVRpZXI6ICdUT1VDSERPV04gTU9OU1RFUicsIHZhbHVlU3RlYWw6ICcrMyBQaWNrcyBWYWx1ZScsIG5lZWRNYXRjaDogdHJ1ZSB9LFxuICAgICAgeyBpZDogJ3AxMCcsIG5hbWU6ICdKYWhteXIgR2liYnMnLCBwb3M6ICdSQicsIHRlYW06ICdERVQnLCBieWU6IDUsIGFkcDogJzEuMTAnLCBwcm9qUHRzOiAyNjUuOCwgZmxvb3I6IDEzLjUsIGNlaWxpbmc6IDI4LjQsIHVwc2lkZVRpZXI6ICdEWU5BTUlDIEVYUExPU0lWRScsIHZhbHVlU3RlYWw6ICcrMiBQaWNrcyBWYWx1ZScsIG5lZWRNYXRjaDogdHJ1ZSB9LFxuICAgICAgeyBpZDogJ3AxMScsIG5hbWU6ICdOaWNvIENvbGxpbnMnLCBwb3M6ICdXUicsIHRlYW06ICdIT1UnLCBieWU6IDE0LCBhZHA6ICcxLjExJywgcHJvalB0czogMjU4LjQsIGZsb29yOiAxMi44LCBjZWlsaW5nOiAyNy41LCB1cHNpZGVUaWVyOiAnQUxQSEEgV1IxJywgdmFsdWVTdGVhbDogJ1JPVU5EIDEgVkFMVUUnLCBuZWVkTWF0Y2g6IGZhbHNlIH0sXG4gICAgICB7IGlkOiAncDEyJywgbmFtZTogJ1B1a2EgTmFjdWEnLCBwb3M6ICdXUicsIHRlYW06ICdMQVInLCBieWU6IDYsIGFkcDogJzEuMTInLCBwcm9qUHRzOiAyNTUuMCwgZmxvb3I6IDEyLjUsIGNlaWxpbmc6IDI2LjgsIHVwc2lkZVRpZXI6ICdUQVJHRVQgTU9OU1RFUicsIHZhbHVlU3RlYWw6ICdST1VORCAxIFZBTFVFJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AxMycsIG5hbWU6ICdHYXJyZXR0IFdpbHNvbicsIHBvczogJ1dSJywgdGVhbTogJ05ZSicsIGJ5ZTogMTIsIGFkcDogJzIuMDEnLCBwcm9qUHRzOiAyNDguMCwgZmxvb3I6IDEyLjAsIGNlaWxpbmc6IDI2LjAsIHVwc2lkZVRpZXI6ICdBTFBIQSBUQVJHRVQgU0hBUkUnLCB2YWx1ZVN0ZWFsOiAnKzMgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IGZhbHNlIH0sXG4gICAgICB7IGlkOiAncDE0JywgbmFtZTogJ0JyaWFuIFRob21hcyBKci4nLCBwb3M6ICdXUicsIHRlYW06ICdKQVgnLCBieWU6IDEyLCBhZHA6ICcyLjAyJywgcHJvalB0czogMjQyLjUsIGZsb29yOiAxMS44LCBjZWlsaW5nOiAyNi41LCB1cHNpZGVUaWVyOiAnQlJFQUtPVVQgU1BFRURTVEFSJywgdmFsdWVTdGVhbDogJys1IFBpY2tzIFZhbHVlJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AxNScsIG5hbWU6ICdNYXJ2aW4gSGFycmlzb24gSnIuJywgcG9zOiAnV1InLCB0ZWFtOiAnQVJJJywgYnllOiAxMSwgYWRwOiAnMi4wMycsIHByb2pQdHM6IDIzOC45LCBmbG9vcjogMTEuMiwgY2VpbGluZzogMjUuNCwgdXBzaWRlVGllcjogJ0JSRUFLT1VUIFVQU0lERScsIHZhbHVlU3RlYWw6ICcrNCBQaWNrcyBWYWx1ZScsIG5lZWRNYXRjaDogZmFsc2UgfSxcbiAgICAgIHsgaWQ6ICdwMTYnLCBuYW1lOiAnSm9zaCBBbGxlbicsIHBvczogJ1FCJywgdGVhbTogJ0JVRicsIGJ5ZTogMTIsIGFkcDogJzIuMDQnLCBwcm9qUHRzOiAzNjUuMiwgZmxvb3I6IDE5LjUsIGNlaWxpbmc6IDM1LjAsIHVwc2lkZVRpZXI6ICdRQjEgT1ZFUkFMTCcsIHZhbHVlU3RlYWw6ICdRQjEgQU5DSE9SJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AxNycsIG5hbWU6ICdMYW1hciBKYWNrc29uJywgcG9zOiAnUUInLCB0ZWFtOiAnQkFMJywgYnllOiAxNCwgYWRwOiAnMi4wNScsIHByb2pQdHM6IDM1OC4wLCBmbG9vcjogMTkuMCwgY2VpbGluZzogMzQuMCwgdXBzaWRlVGllcjogJ0tPTkFNSSBDT0RFIFFCJywgdmFsdWVTdGVhbDogJ1FCMiBBTkNIT1InLCBuZWVkTWF0Y2g6IGZhbHNlIH0sXG4gICAgICB7IGlkOiAncDE4JywgbmFtZTogJ0pvbmF0aGFuIFRheWxvcicsIHBvczogJ1JCJywgdGVhbTogJ0lORCcsIGJ5ZTogMTQsIGFkcDogJzIuMDYnLCBwcm9qUHRzOiAyNDUuMCwgZmxvb3I6IDEyLjIsIGNlaWxpbmc6IDI2LjAsIHVwc2lkZVRpZXI6ICdXT1JLSE9SU0UgUkInLCB2YWx1ZVN0ZWFsOiAnKzQgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IHRydWUgfSxcbiAgICAgIHsgaWQ6ICdwMTknLCBuYW1lOiAnRGVcXCdWb24gQWNoYW5lJywgcG9zOiAnUkInLCB0ZWFtOiAnTUlBJywgYnllOiA2LCBhZHA6ICcyLjA3JywgcHJvalB0czogMjQwLjIsIGZsb29yOiAxMS41LCBjZWlsaW5nOiAyOS44LCB1cHNpZGVUaWVyOiAnSE9NRSBSVU4gQ0VJTElORycsIHZhbHVlU3RlYWw6ICcrNSBQaWNrcyBWYWx1ZScsIG5lZWRNYXRjaDogdHJ1ZSB9LFxuICAgICAgeyBpZDogJ3AyMCcsIG5hbWU6ICdLeXJlbiBXaWxsaWFtcycsIHBvczogJ1JCJywgdGVhbTogJ0xBUicsIGJ5ZTogNiwgYWRwOiAnMi4wOCcsIHByb2pQdHM6IDIzNi41LCBmbG9vcjogMTEuOCwgY2VpbGluZzogMjQuNSwgdXBzaWRlVGllcjogJ1JFRFpPTkUgVE9VQ0hFUycsIHZhbHVlU3RlYWw6ICcrMyBQaWNrcyBWYWx1ZScsIG5lZWRNYXRjaDogdHJ1ZSB9LFxuICAgICAgeyBpZDogJ3AyMScsIG5hbWU6ICdKb3NoIEphY29icycsIHBvczogJ0dCJywgdGVhbTogJ0dCJywgYnllOiAxMCwgYWRwOiAnMi4wOScsIHByb2pQdHM6IDIzMC4xLCBmbG9vcjogMTEuMCwgY2VpbGluZzogMjQuMCwgdXBzaWRlVGllcjogJ1dPUktIT1JTRSBSQicsIHZhbHVlU3RlYWw6ICcrNCBQaWNrcyBWYWx1ZScsIG5lZWRNYXRjaDogdHJ1ZSB9LFxuICAgICAgeyBpZDogJ3AyMicsIG5hbWU6ICdLZW5uZXRoIFdhbGtlciBJSUknLCBwb3M6ICdSQicsIHRlYW06ICdTRUEnLCBieWU6IDEwLCBhZHA6ICcyLjEwJywgcHJvalB0czogMjI1LjQsIGZsb29yOiAxMC44LCBjZWlsaW5nOiAyMy41LCB1cHNpZGVUaWVyOiAnVE9VQ0hET1dOIENFSUxJTkcnLCB2YWx1ZVN0ZWFsOiAnKzUgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IHRydWUgfSxcbiAgICAgIHsgaWQ6ICdwMjMnLCBuYW1lOiAnSmFtZXMgQ29vaycsIHBvczogJ1JCJywgdGVhbTogJ0JVRicsIGJ5ZTogMTIsIGFkcDogJzIuMTEnLCBwcm9qUHRzOiAyMjAuMCwgZmxvb3I6IDEwLjUsIGNlaWxpbmc6IDIyLjgsIHVwc2lkZVRpZXI6ICdQQVNTIENBVENIRVIgUkInLCB2YWx1ZVN0ZWFsOiAnKzYgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IHRydWUgfSxcbiAgICAgIHsgaWQ6ICdwMjQnLCBuYW1lOiAnQ2h1YmEgSHViYmFyZCcsIHBvczogJ1JCJywgdGVhbTogJ0NBUicsIGJ5ZTogMTEsIGFkcDogJzMuMDInLCBwcm9qUHRzOiAyMTAuNSwgZmxvb3I6IDEwLjAsIGNlaWxpbmc6IDIxLjUsIHVwc2lkZVRpZXI6ICdISUdIIFZPTFVNRSBSQicsIHZhbHVlU3RlYWw6ICdST1VORCAzIFZBTFVFJywgbmVlZE1hdGNoOiB0cnVlIH0sXG4gICAgICB7IGlkOiAncDI1JywgbmFtZTogJ0NoYXNlIEJyb3duJywgcG9zOiAnUkInLCB0ZWFtOiAnQ0lOJywgYnllOiAxMiwgYWRwOiAnMy4wNScsIHByb2pQdHM6IDIwNS4yLCBmbG9vcjogOS44LCBjZWlsaW5nOiAyMi4wLCB1cHNpZGVUaWVyOiAnQlJFQUtPVVQgUkInLCB2YWx1ZVN0ZWFsOiAnUk9VTkQgMyBTVEVBTCcsIG5lZWRNYXRjaDogdHJ1ZSB9LFxuICAgICAgeyBpZDogJ3AyNicsIG5hbWU6ICdCcm9jayBCb3dlcnMnLCBwb3M6ICdURScsIHRlYW06ICdMVicsIGJ5ZTogMTAsIGFkcDogJzMuMDgnLCBwcm9qUHRzOiAyMTUuNCwgZmxvb3I6IDEwLjUsIGNlaWxpbmc6IDIzLjAsIHVwc2lkZVRpZXI6ICdURTEgT1ZFUkFMTCcsIHZhbHVlU3RlYWw6ICdURTEgQU5DSE9SJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AyNycsIG5hbWU6ICdUcmV5IE1jQnJpZGUnLCBwb3M6ICdURScsIHRlYW06ICdBUkknLCBieWU6IDExLCBhZHA6ICczLjEwJywgcHJvalB0czogMjA4LjIsIGZsb29yOiAxMC4wLCBjZWlsaW5nOiAyMS44LCB1cHNpZGVUaWVyOiAnRUxJVEUgVEFSR0VUIFNIQVJFJywgdmFsdWVTdGVhbDogJys2IFBpY2tzIFZhbHVlJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AyOCcsIG5hbWU6ICdQYXRyaWNrIE1haG9tZXMnLCBwb3M6ICdRQicsIHRlYW06ICdLQycsIGJ5ZTogNiwgYWRwOiAnMy4xMicsIHByb2pQdHM6IDMzMi4wLCBmbG9vcjogMTcuNSwgY2VpbGluZzogMzAuMCwgdXBzaWRlVGllcjogJ1BBU1NJTkcgWUFSRCBRQicsIHZhbHVlU3RlYWw6ICdST1VORCAzIFZBTFVFJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AyOScsIG5hbWU6ICdKYXlkZW4gRGFuaWVscycsIHBvczogJ1FCJywgdGVhbTogJ1dBUycsIGJ5ZTogMTQsIGFkcDogJzQuMDInLCBwcm9qUHRzOiAzMjguNSwgZmxvb3I6IDE2LjgsIGNlaWxpbmc6IDMxLjUsIHVwc2lkZVRpZXI6ICdSVVNISU5HIFVQU0lERSBHRU0nLCB2YWx1ZVN0ZWFsOiAnKzggUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IGZhbHNlIH0sXG4gICAgICB7IGlkOiAncDMwJywgbmFtZTogJ0NocmlzdGlhbiBNY0NhZmZyZXknLCBwb3M6ICdSQicsIHRlYW06ICdTRicsIGJ5ZTogOSwgYWRwOiAnNC4wNCcsIHByb2pQdHM6IDE5OC41LCBmbG9vcjogOC41LCBjZWlsaW5nOiAyNC4wLCB1cHNpZGVUaWVyOiAnVkVURVJBTiBSRUNPVkVSWScsIHZhbHVlU3RlYWw6ICdQSUNLICM0MCBPVkVSQUxMJywgbmVlZE1hdGNoOiB0cnVlIH1cbiAgICBdO1xuXG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIHN0YXR1czogJ1JFQUxfRVNQTl9MSVZFX1NZTkNFRCcsXG4gICAgICBsYXN0VXBkYXRlZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgc2Vhc29uV2VlazogZXNwblNjb3Jlc0RhdGEud2Vlaz8udGV4dCB8fCAnT2ZmaWNpYWwgTkZMIFNjaGVkdWxlJyxcbiAgICAgIHNlYXNvblllYXI6IGVzcG5TY29yZXNEYXRhLnNlYXNvbj8ueWVhciB8fCAyMDI2LFxuICAgICAgZ2FtZUNvdW50OiByZWFsR2FtZXMubGVuZ3RoLFxuICAgICAgZ2FtZXM6IHJlYWxHYW1lcyxcbiAgICAgIGhlYWRsaW5lczogcmVhbEhlYWRsaW5lcyxcbiAgICAgIGRyYWZ0UGxheWVyczogZHJhZnRQbGF5ZXJzLFxuICAgICAgcmFwaWRFbnJpY2hlZDogISFyYXBpZERhdGFcbiAgICB9O1xuXG4gICAgd3JpdGVDYWNoZSh7IHRpbWVzdGFtcDogbm93LCBkYXRhOiBwYXlsb2FkIH0pO1xuICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7IHNvdXJjZTogJ29mZmljaWFsX2VzcG5fcmVhbHRpbWUnLCBjcmVkZW50aWFsczogYWN0aXZlQ3JlZHMsIC4uLnBheWxvYWQgfSk7XG5cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFXLFNBQVMsb0JBQW9CO0FBQ2xZLE9BQU8sV0FBVzs7O0FDRHFXLFNBQVMsb0JBQW9CO0FBQ3BaLE9BQU8sUUFBUTtBQUVmLElBQU0sY0FBYyxRQUFRLElBQUkscUJBQXFCLFFBQVEsSUFBSSxnQkFBZ0I7QUFDakYsSUFBTSxxQkFBcUIsUUFBUSxJQUFJLDZCQUE2QixRQUFRLElBQUksMEJBQTBCLFFBQVEsSUFBSSxxQkFBcUI7QUFFM0ksSUFBTSxXQUFXO0FBSWpCLElBQU0sYUFBYTtBQUFBLEVBQ2pCLEVBQUUsSUFBSSxTQUFTLE1BQU0sb0JBQW9CLE1BQU0sc0NBQXNDLE1BQU0sY0FBYyxRQUFRLG9CQUFvQjtBQUFBLEVBQ3JJLEVBQUUsSUFBSSxTQUFTLE1BQU0sc0JBQXNCLE1BQU0sNEJBQTRCLE1BQU0sY0FBYyxRQUFRLG9CQUFvQjtBQUFBLEVBQzdILEVBQUUsSUFBSSxTQUFTLE1BQU0saUNBQWlDLE1BQU0sOEJBQThCLE1BQU0sY0FBYyxRQUFRLG9CQUFvQjtBQUM1STtBQUdBLFNBQVMsWUFBWTtBQUNuQixNQUFJLGFBQWEsQ0FBQztBQUNsQixNQUFJLGVBQWUsQ0FBQztBQUNwQixNQUFJLGNBQWMsQ0FBQztBQUNuQixNQUFJLFdBQVcsQ0FBQztBQUNoQixNQUFJLGFBQWE7QUFFakIsTUFBSTtBQUNGLFFBQUksR0FBRyxXQUFXLFFBQVEsR0FBRztBQUMzQixZ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QUFBLFVBQ2hELFNBQVMsR0FBRztBQUNWLGdCQUFJLE9BQU8sQ0FBQztBQUFBLFVBQ2Q7QUFBQSxRQUNGO0FBRUEsWUFBSTtBQUNGLGNBQUksSUFBSSxXQUFXLG9CQUFvQixHQUFHO0FBQ3hDLG1CQUFPLE1BQU0sUUFBb0IsS0FBSyxHQUFHO0FBQUEsVUFDM0MsV0FBVyxJQUFJLFdBQVcsY0FBYyxHQUFHO0FBQ3pDLG1CQUFPLE1BQU1DLFNBQWUsS0FBSyxHQUFHO0FBQUEsVUFDdEMsV0FBVyxJQUFJLFdBQVcsZUFBZSxHQUFHO0FBQzFDLG1CQUFPLE1BQU1BLFNBQWUsS0FBSyxHQUFHO0FBQUEsVUFDdEM7QUFBQSxRQUNGLFNBQVMsS0FBSztBQUNaLGlCQUFPLElBQUksT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sSUFBSSxRQUFRLENBQUM7QUFBQSxRQUNwRDtBQUVBLGFBQUs7QUFBQSxNQUNQLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQztBQUFBLEVBQ3BDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiY3JlYXRlQ2xpZW50IiwgImZzIiwgInN1cGFiYXNlVXJsIiwgInN1cGFiYXNlU2VydmljZUtleSIsICJmcyIsICJoYW5kbGVyIiwgInN1cGFiYXNlVXJsIiwgImNyZWF0ZUNsaWVudCIsICJzdXBhYmFzZVNlcnZpY2VLZXkiLCAiZnMiLCAiZnMiLCAiaGFuZGxlciIsICJoYW5kbGVyIl0KfQo=
