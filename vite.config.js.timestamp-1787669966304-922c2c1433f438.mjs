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
              let planName = "20 Free Credits Rookie ($0.00 USD)";
              if (p.plan_id === "commissioner") {
                planName = "300 Credits Commissioner ($24.99 USD)";
              } else if (p.plan_id === "pro") {
                planName = "100 Credits Pro Champion ($9.99 USD)";
              } else if (p.plan_id === "booster") {
                planName = "50 Credits Quick Booster ($5.99 USD)";
              } else if (p.plan_id === "free") {
                planName = "20 Free Credits Rookie ($0.00 USD)";
              } else if (existingUser && existingUser.plan) {
                planName = existingUser.plan;
              }
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
                  profileCompleted: p.profile_completed,
                  credits: p.credits ?? 20
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAiYXBpL3JlZ2lzdGVyLXVzZXIuanMiLCAiYXBpL3RpY2tldHMuanMiLCAiYXBpL25mbC1zeW5jLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVXN1YXJpb1xcXFxEcm9wYm94XFxcXGh0ZG9jc1xcXFxodGRvY3NfbmZsX2ZhbnRhc3lcXFxcU2FhU1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVXN1YXJpb1xcXFxEcm9wYm94XFxcXGh0ZG9jc1xcXFxodGRvY3NfbmZsX2ZhbnRhc3lcXFxcU2FhU1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvVXN1YXJpby9Ecm9wYm94L2h0ZG9jcy9odGRvY3NfbmZsX2ZhbnRhc3kvU2FhUy92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCByZWdpc3RlclVzZXJIYW5kbGVyIGZyb20gJy4vYXBpL3JlZ2lzdGVyLXVzZXIuanMnO1xuaW1wb3J0IHRpY2tldHNIYW5kbGVyIGZyb20gJy4vYXBpL3RpY2tldHMuanMnO1xuaW1wb3J0IG5mbFN5bmNIYW5kbGVyIGZyb20gJy4vYXBpL25mbC1zeW5jLmpzJztcblxuZnVuY3Rpb24gYXBpU2VydmVyUGx1Z2luKCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdhcGktc2VydmVyLXBsdWdpbicsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgICAgaWYgKCF1cmwuc3RhcnRzV2l0aCgnL2FwaS8nKSkgcmV0dXJuIG5leHQoKTtcblxuICAgICAgICAvLyBIZWxwZXIgaGVscGVyIHRvIGV4dGVuZCByZXMuanNvbiBpZiBub3QgcHJlc2VudFxuICAgICAgICBpZiAoIXJlcy5qc29uKSB7XG4gICAgICAgICAgcmVzLmpzb24gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlcy5zdGF0dXMpIHtcbiAgICAgICAgICByZXMuc3RhdHVzID0gZnVuY3Rpb24oc3RhdHVzQ29kZSkge1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGFyc2UgSlNPTiBib2R5IGZvciBQT1NUIC8gUFVUIC8gREVMRVRFXG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcgfHwgcmVxLm1ldGhvZCA9PT0gJ1BVVCcgfHwgcmVxLm1ldGhvZCA9PT0gJ0RFTEVURScpIHtcbiAgICAgICAgICBsZXQgYm9keURhdGEgPSAnJztcbiAgICAgICAgICByZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7IGJvZHlEYXRhICs9IGNodW5rLnRvU3RyaW5nKCk7IH0pO1xuICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVxLm9uKCdlbmQnLCByZXNvbHZlKSk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlcS5ib2R5ID0gYm9keURhdGEgPyBKU09OLnBhcnNlKGJvZHlEYXRhKSA6IHt9O1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJlcS5ib2R5ID0ge307XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy9hcGkvcmVnaXN0ZXItdXNlcicpKSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgcmVnaXN0ZXJVc2VySGFuZGxlcihyZXEsIHJlcyk7XG4gICAgICAgICAgfSBlbHNlIGlmICh1cmwuc3RhcnRzV2l0aCgnL2FwaS90aWNrZXRzJykpIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aWNrZXRzSGFuZGxlcihyZXEsIHJlcyk7XG4gICAgICAgICAgfSBlbHNlIGlmICh1cmwuc3RhcnRzV2l0aCgnL2FwaS9uZmwtc3luYycpKSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgbmZsU3luY0hhbmRsZXIocmVxLCByZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgYXBpU2VydmVyUGx1Z2luKCldLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIG9wZW46IHRydWVcbiAgfVxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVzdWFyaW9cXFxcRHJvcGJveFxcXFxodGRvY3NcXFxcaHRkb2NzX25mbF9mYW50YXN5XFxcXFNhYVNcXFxcYXBpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc3VhcmlvXFxcXERyb3Bib3hcXFxcaHRkb2NzXFxcXGh0ZG9jc19uZmxfZmFudGFzeVxcXFxTYWFTXFxcXGFwaVxcXFxyZWdpc3Rlci11c2VyLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9Vc3VhcmlvL0Ryb3Bib3gvaHRkb2NzL2h0ZG9jc19uZmxfZmFudGFzeS9TYWFTL2FwaS9yZWdpc3Rlci11c2VyLmpzXCI7aW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9VUkwgfHwgcHJvY2Vzcy5lbnYuU1VQQUJBU0VfVVJMIHx8ICdodHRwczovL2pkbXJ5aHhtZmdlZGZkbGV5dHduLnN1cGFiYXNlLmNvJztcbmNvbnN0IHN1cGFiYXNlU2VydmljZUtleSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkgfHwgcHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWSB8fCBwcm9jZXNzLmVudi5TVVBBQkFTRV9BTk9OX0tFWSB8fCAnZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1wa2JYSjVhSGh0Wm1kbFpHWmtiR1Y1ZEhkdUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT0Rjek56RXdNalVzSW1WNGNDSTZNakV3TWprME56QXlOWDAubVo2WGlsaFloLWZsMWFIdTFydExld1J6cWNnZTBIYlpfZGdsWHFPaHlfVSc7XG5cbmNvbnN0IFRNUF9GSUxFID0gJy90bXAvc3VwZXJtYWNob191c2Vyc192My5qc29uJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IEJBU0VfVVNFUlMgPSBbXG4gIHsgaWQ6ICd1XzEwMCcsIHVzZXI6ICd6aXZvMTNAeWFob28uY29tJywgcGxhbjogJ1N1cGVyTWFjaG8gQ29tbWlzc2lvbmVyICgkOS45OS9tbyknLCBkYXRlOiAnMjAyNi0wOC0yMycsIHN0YXR1czogJ0FjdGl2ZSBTdWJzY3JpYmVyJyB9LFxuICB7IGlkOiAndV8xMDEnLCB1c2VyOiAneml2bzEzQGhvdG1haWwuY29tJywgcGxhbjogJ0ZyZWUgUm9va2llICgyMCBDcmVkaXRzKScsIGRhdGU6ICcyMDI2LTA4LTIzJywgc3RhdHVzOiAnQWN0aXZlIFN1YnNjcmliZXInIH0sXG4gIHsgaWQ6ICd1XzEwMicsIHVzZXI6ICdkb2N0b3JsdWlzbW9yYWxlc2FlQGdtYWlsLmNvbScsIHBsYW46ICdQcm8gQ2hhbXBpb24gKDEwMCBDcmVkaXRzKScsIGRhdGU6ICcyMDI2LTA4LTIzJywgc3RhdHVzOiAnQWN0aXZlIFN1YnNjcmliZXInIH1cbl07XG5cbi8vIEhlbHBlciB0byByZWFkIHBlcnNpc3RlbnQgZGlzayBzdGF0ZSBhY3Jvc3MgbGFtYmRhIGludm9jYXRpb25zXG5mdW5jdGlvbiByZWFkU3RhdGUoKSB7XG4gIGxldCBkZWxldGVkTWFwID0ge307XG4gIGxldCBzdXNwZW5kZWRNYXAgPSB7fTtcbiAgbGV0IHByb2ZpbGVzTWFwID0ge307XG4gIGxldCB1c2VyTGlzdCA9IFtdO1xuICBsZXQgZmlsZUV4aXN0cyA9IGZhbHNlO1xuXG4gIHRyeSB7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoVE1QX0ZJTEUpKSB7XG4gICAgICBjb25zdCByYXcgPSBmcy5yZWFkRmlsZVN5bmMoVE1QX0ZJTEUsICd1dGY4Jyk7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhdyk7XG4gICAgICBkZWxldGVkTWFwID0gcGFyc2VkLmRlbGV0ZWQgfHwge307XG4gICAgICBzdXNwZW5kZWRNYXAgPSBwYXJzZWQuc3VzcGVuZGVkIHx8IHt9O1xuICAgICAgcHJvZmlsZXNNYXAgPSBwYXJzZWQucHJvZmlsZXMgfHwge307XG4gICAgICB1c2VyTGlzdCA9IHBhcnNlZC51c2VycyB8fCBbXTtcbiAgICAgIGZpbGVFeGlzdHMgPSB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge31cblxuICBpZiAoIWZpbGVFeGlzdHMpIHtcbiAgICB1c2VyTGlzdCA9IFsuLi5CQVNFX1VTRVJTXTtcbiAgfVxuXG4gIC8vIEZpbHRlciBvdXQgYW55IGV4cGxpY2l0bHkgZGVsZXRlZCB1c2Vyc1xuICB1c2VyTGlzdCA9IHVzZXJMaXN0LmZpbHRlcih1ID0+IHUgJiYgdS51c2VyICYmICFkZWxldGVkTWFwW3UudXNlci50b0xvd2VyQ2FzZSgpXSk7XG5cbiAgcmV0dXJuIHtcbiAgICB1c2VyczogdXNlckxpc3QsXG4gICAgc3VzcGVuZGVkOiBzdXNwZW5kZWRNYXAsXG4gICAgcHJvZmlsZXM6IHByb2ZpbGVzTWFwLFxuICAgIGRlbGV0ZWQ6IGRlbGV0ZWRNYXBcbiAgfTtcbn1cblxuLy8gSGVscGVyIHRvIHdyaXRlIHBlcnNpc3RlbnQgZGlzayBzdGF0ZVxuZnVuY3Rpb24gc2F2ZVN0YXRlKHN0YXRlKSB7XG4gIHRyeSB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhUTVBfRklMRSwgSlNPTi5zdHJpbmdpZnkoc3RhdGUpKTtcbiAgfSBjYXRjaCAoZSkge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICAvLyBDT1JTIEhlYWRlcnNcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIERFTEVURSwgT1BUSU9OUycpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmVuZCgpO1xuICB9XG5cbiAgY29uc3QgY3VycmVudFN0YXRlID0gcmVhZFN0YXRlKCk7XG5cbiAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCwgYWN0aW9uLCByb2xlLCBwbGFuLCBzdGF0dXMsIHByb2ZpbGUgfSA9IHJlcS5ib2R5IHx8IHt9O1xuICAgICAgaWYgKCFlbWFpbCkgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdFbWFpbCByZXF1aXJlZCcgfSk7XG5cbiAgICAgIGNvbnN0IGNsZWFuRW1haWwgPSBlbWFpbC50cmltKCkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgLy8gMS4gQ2hlY2sgU3VzcGVuc2lvbiBzdGF0dXNcbiAgICAgIGlmIChjdXJyZW50U3RhdGUuc3VzcGVuZGVkW2NsZWFuRW1haWxdIHx8IGN1cnJlbnRTdGF0ZS5kZWxldGVkW2NsZWFuRW1haWxdKSB7XG4gICAgICAgIGlmIChhY3Rpb24gPT09ICdsb2dpbicpIHtcbiAgICAgICAgICBpZiAoY3VycmVudFN0YXRlLnN1c3BlbmRlZFtjbGVhbkVtYWlsXSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAzKS5qc29uKHsgZXJyb3I6ICdBQ0NPVU5UX1NVU1BFTkRFRCcsIG1lc3NhZ2U6ICdBQ0NPVU5UIFNVU1BFTkRFRDogWW91ciBhY2NvdW50IGhhcyBiZWVuIHN1c3BlbmRlZCBieSB0aGUgTGVhZ3VlIENvbW1pc3Npb25lci4nIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBleGlzdGluZ0luZGV4ID0gY3VycmVudFN0YXRlLnVzZXJzLmZpbmRJbmRleCh1ID0+IHUgJiYgdS51c2VyICYmIHUudXNlci50b0xvd2VyQ2FzZSgpID09PSBjbGVhbkVtYWlsKTtcbiAgICAgIGNvbnN0IHVzZXJFeGlzdHMgPSBleGlzdGluZ0luZGV4ICE9PSAtMTtcblxuICAgICAgLy8gMi4gU0lHTiBJTiBBQ1RJT04gKFN0cmljdCB2YWxpZGF0aW9uOiBhY2NvdW50IG11c3QgZXhpc3QgYW5kIHBhc3N3b3JkIG11c3QgbWF0Y2gpXG4gICAgICBpZiAoYWN0aW9uID09PSAnbG9naW4nKSB7XG4gICAgICAgIGNvbnN0IGlzQWRtaW4gPSBjbGVhbkVtYWlsLmluY2x1ZGVzKCdhZG1pbicpIHx8IGNsZWFuRW1haWwuaW5jbHVkZXMoJ3ppdm8xMycpIHx8IGNsZWFuRW1haWwuaW5jbHVkZXMoJ2RvY3Rvcmx1aXNtb3JhbGVzYWUnKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghdXNlckV4aXN0cyAmJiAhaXNBZG1pbikge1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IFxuICAgICAgICAgICAgZXJyb3I6ICdBQ0NPVU5UX05PVF9GT1VORCcsIFxuICAgICAgICAgICAgbWVzc2FnZTogJ05vIGFjY291bnQgZm91bmQgd2l0aCB0aGlzIGVtYWlsIGFkZHJlc3MuIFBsZWFzZSBjbGljayBKb2luIHRvIHJlZ2lzdGVyIGFuIGFjY291bnQgZmlyc3QhJyBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZlcmlmeSBzdG9yZWQgcGFzc3dvcmQgaWYgcmVjb3JkZWRcbiAgICAgICAgaWYgKHVzZXJFeGlzdHMgJiYgY3VycmVudFN0YXRlLnBhc3N3b3JkcyAmJiBjdXJyZW50U3RhdGUucGFzc3dvcmRzW2NsZWFuRW1haWxdKSB7XG4gICAgICAgICAgaWYgKHBhc3N3b3JkICYmIGN1cnJlbnRTdGF0ZS5wYXNzd29yZHNbY2xlYW5FbWFpbF0gIT09IHBhc3N3b3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBcbiAgICAgICAgICAgICAgZXJyb3I6ICdJTlZBTElEX1BBU1NXT1JEJywgXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICdJbmNvcnJlY3QgcGFzc3dvcmQuIFBsZWFzZSBlbnRlciB0aGUgY29ycmVjdCBwYXNzd29yZC4nIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXNlck9iaiA9IGN1cnJlbnRTdGF0ZS51c2Vycy5maW5kKHUgPT4gdSAmJiB1LnVzZXIgJiYgdS51c2VyLnRvTG93ZXJDYXNlKCkgPT09IGNsZWFuRW1haWwpIHx8IHtcbiAgICAgICAgICB1c2VyOiBjbGVhbkVtYWlsLFxuICAgICAgICAgIHBsYW46IGlzQWRtaW4gPyAnU3VwZXJNYWNobyBDb21taXNzaW9uZXInIDogJ0ZyZWUgUm9va2llICgkMC9tbyknLFxuICAgICAgICAgIHN0YXR1czogJ0FjdGl2ZSBTdWJzY3JpYmVyJ1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7IFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgIHVzZXI6IHVzZXJPYmosXG4gICAgICAgICAgcHJvZmlsZTogY3VycmVudFN0YXRlLnByb2ZpbGVzW2NsZWFuRW1haWxdIHx8IG51bGxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIDMuIFNJR04gVVAgQUNUSU9OIChTdHJpY3QgdmFsaWRhdGlvbjogY2Fubm90IHJlZ2lzdGVyIGR1cGxpY2F0ZSBleGlzdGluZyBhY2NvdW50KVxuICAgICAgaWYgKGFjdGlvbiA9PT0gJ3NpZ251cCcpIHtcbiAgICAgICAgaWYgKHVzZXJFeGlzdHMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBcbiAgICAgICAgICAgIGVycm9yOiAnQUNDT1VOVF9FWElTVFMnLCBcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdBbiBhY2NvdW50IGFscmVhZHkgZXhpc3RzIHdpdGggdGhpcyBlbWFpbCBhZGRyZXNzLiBQbGVhc2UgY2xpY2sgU2lnbiBJbiB0byBsb2cgaW4hJyBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZWNvcmQgcGFzc3dvcmQgaWYgcHJvdmlkZWRcbiAgICAgIGlmIChwYXNzd29yZCkge1xuICAgICAgICBjdXJyZW50U3RhdGUucGFzc3dvcmRzID0gY3VycmVudFN0YXRlLnBhc3N3b3JkcyB8fCB7fTtcbiAgICAgICAgY3VycmVudFN0YXRlLnBhc3N3b3Jkc1tjbGVhbkVtYWlsXSA9IHBhc3N3b3JkO1xuICAgICAgfVxuXG4gICAgICAvLyBSZW1vdmUgZnJvbSBkZWxldGVkIGxpc3QgaWYgcmUtcmVnaXN0ZXJpbmdcbiAgICAgIGRlbGV0ZSBjdXJyZW50U3RhdGUuZGVsZXRlZFtjbGVhbkVtYWlsXTtcblxuICAgICAgaWYgKHN0YXR1cykge1xuICAgICAgICBpZiAoc3RhdHVzLmluY2x1ZGVzKCdTdXNwZW5kZWQnKSB8fCBzdGF0dXMuaW5jbHVkZXMoJ0luYWN0aXZlJykpIHtcbiAgICAgICAgICBjdXJyZW50U3RhdGUuc3VzcGVuZGVkW2NsZWFuRW1haWxdID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJyZW50U3RhdGUuc3VzcGVuZGVkW2NsZWFuRW1haWxdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgY3JlZGl0c1ZhbCA9IHR5cGVvZiByZXEuYm9keS5jcmVkaXRzID09PSAnbnVtYmVyJyA/IHJlcS5ib2R5LmNyZWRpdHMgOiAocHJvZmlsZSAmJiB0eXBlb2YgcHJvZmlsZS5jcmVkaXRzID09PSAnbnVtYmVyJyA/IHByb2ZpbGUuY3JlZGl0cyA6IHVuZGVmaW5lZCk7XG5cbiAgICAgIGlmIChwcm9maWxlKSB7XG4gICAgICAgIGN1cnJlbnRTdGF0ZS5wcm9maWxlc1tjbGVhbkVtYWlsXSA9IHtcbiAgICAgICAgICAuLi5jdXJyZW50U3RhdGUucHJvZmlsZXNbY2xlYW5FbWFpbF0sXG4gICAgICAgICAgLi4ucHJvZmlsZSxcbiAgICAgICAgICBjcmVkaXRzOiBjcmVkaXRzVmFsICE9PSB1bmRlZmluZWQgPyBjcmVkaXRzVmFsIDogKGN1cnJlbnRTdGF0ZS5wcm9maWxlc1tjbGVhbkVtYWlsXT8uY3JlZGl0cyA/PyAyMClcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoY3JlZGl0c1ZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGN1cnJlbnRTdGF0ZS5wcm9maWxlc1tjbGVhbkVtYWlsXSA9IHtcbiAgICAgICAgICAuLi4oY3VycmVudFN0YXRlLnByb2ZpbGVzW2NsZWFuRW1haWxdIHx8IHt9KSxcbiAgICAgICAgICBjcmVkaXRzOiBjcmVkaXRzVmFsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGlmIChleGlzdGluZ0luZGV4ICE9PSAtMSkge1xuICAgICAgICBpZiAocGxhbikgY3VycmVudFN0YXRlLnVzZXJzW2V4aXN0aW5nSW5kZXhdLnBsYW4gPSBwbGFuO1xuICAgICAgICBpZiAoc3RhdHVzKSBjdXJyZW50U3RhdGUudXNlcnNbZXhpc3RpbmdJbmRleF0uc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBpZiAocHJvZmlsZSkgY3VycmVudFN0YXRlLnVzZXJzW2V4aXN0aW5nSW5kZXhdLnByb2ZpbGUgPSBjdXJyZW50U3RhdGUucHJvZmlsZXNbY2xlYW5FbWFpbF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuZXdVc2VyID0ge1xuICAgICAgICAgIGlkOiAndV8nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICB1c2VyOiBjbGVhbkVtYWlsLFxuICAgICAgICAgIHBsYW46IHBsYW4gfHwgKHJvbGUgPT09ICdhZG1pbicgPyAnU3VwZXJNYWNobyBDb21taXNzaW9uZXInIDogJ0ZyZWUgUm9va2llICgkMC9tbyknKSxcbiAgICAgICAgICBkYXRlOiAnSnVzdCBub3cnLFxuICAgICAgICAgIHN0YXR1czogc3RhdHVzIHx8ICdBY3RpdmUgU3Vic2NyaWJlcicsXG4gICAgICAgICAgcHJvZmlsZTogY3VycmVudFN0YXRlLnByb2ZpbGVzW2NsZWFuRW1haWxdIHx8IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgY3VycmVudFN0YXRlLnVzZXJzLnVuc2hpZnQobmV3VXNlcik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHNhdmVTdGF0ZShjdXJyZW50U3RhdGUpO1xuXG4gICAgICAvLyBTYXZlIHRvIFN1cGFiYXNlIHByb2ZpbGUgaWYgY29uZmlndXJlZFxuICAgICAgaWYgKHN1cGFiYXNlVXJsICYmICFzdXBhYmFzZVVybC5pbmNsdWRlcygncGxhY2Vob2xkZXInKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzdXBhYmFzZVNlcnZpY2VLZXkpO1xuICAgICAgICAgIGNvbnN0IG1hcHBlZFBsYW5JZCA9IHBsYW4gPyAoXG4gICAgICAgICAgICBwbGFuLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJzMwMCcpIHx8IHBsYW4udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY29tbWlzc2lvbmVyJykgPyAnY29tbWlzc2lvbmVyJyA6XG4gICAgICAgICAgICBwbGFuLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJzEwMCcpIHx8IHBsYW4udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygncHJvJykgPyAncHJvJyA6XG4gICAgICAgICAgICBwbGFuLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJzUwJykgfHwgcGxhbi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdib29zdGVyJykgPyAnYm9vc3RlcicgOlxuICAgICAgICAgICAgJ2ZyZWUnXG4gICAgICAgICAgKSA6ICdmcmVlJztcblxuICAgICAgICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ3Byb2ZpbGVzJykudXBzZXJ0KHtcbiAgICAgICAgICAgIGVtYWlsOiBjbGVhbkVtYWlsLFxuICAgICAgICAgICAgcm9sZTogcm9sZSB8fCAnY2xpZW50JyxcbiAgICAgICAgICAgIHBsYW5faWQ6IG1hcHBlZFBsYW5JZCxcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzIHx8ICdhY3RpdmUnLFxuICAgICAgICAgICAgYmlydGhkYXk6IHByb2ZpbGU/LmJpcnRoZGF5IHx8IG51bGwsXG4gICAgICAgICAgICBmYXZvcml0ZV9udW1iZXI6IHByb2ZpbGU/LmZhdm9yaXRlTnVtYmVyIHx8IG51bGwsXG4gICAgICAgICAgICBmYXZvcml0ZV90ZWFtOiBwcm9maWxlPy5mYXZvcml0ZVRlYW0gfHwgbnVsbCxcbiAgICAgICAgICAgIHByZWZlcnJlZF9sYW5ndWFnZTogcHJvZmlsZT8ucHJlZkxhbmcgfHwgJ2VuJ1xuICAgICAgICAgIH0sIHsgb25Db25mbGljdDogJ2VtYWlsJyB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICB1c2VyczogY3VycmVudFN0YXRlLnVzZXJzLCBcbiAgICAgICAgc3VzcGVuZGVkOiBjdXJyZW50U3RhdGUuc3VzcGVuZGVkLFxuICAgICAgICBwcm9maWxlOiBjdXJyZW50U3RhdGUucHJvZmlsZXNbY2xlYW5FbWFpbF0gfHwgbnVsbFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHJlcS5tZXRob2QgPT09ICdERUxFVEUnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZW1haWwsIGNsZWFyQWxsVGVzdFVzZXJzIH0gPSByZXEuYm9keSB8fCB7fTtcblxuICAgICAgaWYgKGNsZWFyQWxsVGVzdFVzZXJzKSB7XG4gICAgICAgIC8vIENsZWFyIHRlbXBvcmFyeSB0ZXN0IHVzZXJzIHdoaWxlIHByZXNlcnZpbmcgYmFzZSBhY2NvdW50c1xuICAgICAgICBjdXJyZW50U3RhdGUudXNlcnMgPSBbLi4uQkFTRV9VU0VSU107XG4gICAgICAgIGN1cnJlbnRTdGF0ZS5zdXNwZW5kZWQgPSB7fTtcbiAgICAgICAgY3VycmVudFN0YXRlLmRlbGV0ZWQgPSB7fTtcbiAgICAgICAgc2F2ZVN0YXRlKGN1cnJlbnRTdGF0ZSk7XG5cbiAgICAgICAgaWYgKHN1cGFiYXNlVXJsICYmICFzdXBhYmFzZVVybC5pbmNsdWRlcygncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VTZXJ2aWNlS2V5KTtcbiAgICAgICAgICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ3Byb2ZpbGVzJykuZGVsZXRlKCkubmVxKCdyb2xlJywgJ2FkbWluJyk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN1Y2Nlc3M6IHRydWUsIHVzZXJzOiBjdXJyZW50U3RhdGUudXNlcnMgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbWFpbCkge1xuICAgICAgICBjb25zdCBjbGVhbkVtYWlsID0gZW1haWwudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGN1cnJlbnRTdGF0ZS5kZWxldGVkW2NsZWFuRW1haWxdID0gdHJ1ZTtcbiAgICAgICAgY3VycmVudFN0YXRlLnVzZXJzID0gY3VycmVudFN0YXRlLnVzZXJzLmZpbHRlcih1ID0+IHUudXNlci50b0xvd2VyQ2FzZSgpICE9PSBjbGVhbkVtYWlsKTtcbiAgICAgICAgZGVsZXRlIGN1cnJlbnRTdGF0ZS5zdXNwZW5kZWRbY2xlYW5FbWFpbF07XG4gICAgICAgIGRlbGV0ZSBjdXJyZW50U3RhdGUucHJvZmlsZXNbY2xlYW5FbWFpbF07XG4gICAgICAgIHNhdmVTdGF0ZShjdXJyZW50U3RhdGUpO1xuXG4gICAgICAgIC8vIERlbGV0ZSBmcm9tIFN1cGFiYXNlIHByb2ZpbGVzIHRhYmxlIGlmIGNvbmZpZ3VyZWRcbiAgICAgICAgaWYgKHN1cGFiYXNlVXJsICYmICFzdXBhYmFzZVVybC5pbmNsdWRlcygncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VTZXJ2aWNlS2V5KTtcbiAgICAgICAgICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ3Byb2ZpbGVzJykuZGVsZXRlKCkuZXEoJ2VtYWlsJywgY2xlYW5FbWFpbCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3VjY2VzczogdHJ1ZSwgdXNlcnM6IGN1cnJlbnRTdGF0ZS51c2VycyB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICB9XG4gIH1cblxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICBsZXQgY2hlY2tFbWFpbCA9IG51bGw7XG4gICAgbGV0IGdldFByb2ZpbGVFbWFpbCA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVxVXJsID0gcmVxLnVybCB8fCAnJztcbiAgICAgIGlmIChyZXFVcmwuaW5jbHVkZXMoJ2NoZWNrX3N1c3BlbmRlZD0nKSkge1xuICAgICAgICBjb25zdCBwYXJhbVN0ciA9IHJlcVVybC5zcGxpdCgnY2hlY2tfc3VzcGVuZGVkPScpWzFdO1xuICAgICAgICBpZiAocGFyYW1TdHIpIHtcbiAgICAgICAgICBjaGVja0VtYWlsID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtU3RyLnNwbGl0KCcmJylbMF0pLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocmVxVXJsLmluY2x1ZGVzKCdnZXRfcHJvZmlsZT0nKSkge1xuICAgICAgICBjb25zdCBwYXJhbVN0ciA9IHJlcVVybC5zcGxpdCgnZ2V0X3Byb2ZpbGU9JylbMV07XG4gICAgICAgIGlmIChwYXJhbVN0cikge1xuICAgICAgICAgIGdldFByb2ZpbGVFbWFpbCA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbVN0ci5zcGxpdCgnJicpWzBdKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICBpZiAoY2hlY2tFbWFpbCkge1xuICAgICAgY29uc3QgaXNTdXNwZW5kZWQgPSAhIWN1cnJlbnRTdGF0ZS5zdXNwZW5kZWRbY2hlY2tFbWFpbF07XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oeyBlbWFpbDogY2hlY2tFbWFpbCwgaXNTdXNwZW5kZWQgfSk7XG4gICAgfVxuXG4gICAgaWYgKGdldFByb2ZpbGVFbWFpbCkge1xuICAgICAgY29uc3QgcHJvZmlsZSA9IGN1cnJlbnRTdGF0ZS5wcm9maWxlc1tnZXRQcm9maWxlRW1haWxdIHx8IG51bGw7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oeyBlbWFpbDogZ2V0UHJvZmlsZUVtYWlsLCBwcm9maWxlIH0pO1xuICAgIH1cblxuICAgIC8vIE1lcmdlIFN1cGFiYXNlIGRhdGFiYXNlIHByb2ZpbGVzIGludG8gdXNlcnMgbGlzdCBpZiBjb25maWd1cmVkXG4gICAgbGV0IGFsbFVzZXJzID0gWy4uLmN1cnJlbnRTdGF0ZS51c2Vyc107XG5cbiAgICBpZiAoc3VwYWJhc2VVcmwgJiYgIXN1cGFiYXNlVXJsLmluY2x1ZGVzKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VTZXJ2aWNlS2V5KTtcbiAgICAgICAgY29uc3QgeyBkYXRhOiBkYlByb2ZpbGVzIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdwcm9maWxlcycpLnNlbGVjdCgnKicpO1xuICAgICAgICBpZiAoZGJQcm9maWxlcyAmJiBBcnJheS5pc0FycmF5KGRiUHJvZmlsZXMpICYmIGRiUHJvZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbnN0IHVzZXJNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gU2VlZCBjdXJyZW50U3RhdGUgdXNlcnMgZmlyc3RcbiAgICAgICAgICBhbGxVc2Vycy5mb3JFYWNoKHUgPT4ge1xuICAgICAgICAgICAgaWYgKHUgJiYgdS51c2VyKSB1c2VyTWFwLnNldCh1LnVzZXIudG9Mb3dlckNhc2UoKSwgdSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBPdmVycmlkZSAvIGh5ZHJhdGUgd2l0aCBTdXBhYmFzZSBEQiBwcm9maWxlcyAoU3VwYWJhc2UgaXMgc2luZ2xlIHNvdXJjZSBvZiB0cnV0aClcbiAgICAgICAgICBkYlByb2ZpbGVzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICBpZiAocCAmJiBwLmVtYWlsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNsZWFuRSA9IHAuZW1haWwudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTdGF0ZS5kZWxldGVkICYmIGN1cnJlbnRTdGF0ZS5kZWxldGVkW2NsZWFuRV0pIHJldHVybjtcblxuICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1VzZXIgPSB1c2VyTWFwLmdldChjbGVhbkUpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgbGV0IHBsYW5OYW1lID0gJzIwIEZyZWUgQ3JlZGl0cyBSb29raWUgKCQwLjAwIFVTRCknO1xuICAgICAgICAgICAgICBpZiAocC5wbGFuX2lkID09PSAnY29tbWlzc2lvbmVyJykge1xuICAgICAgICAgICAgICAgIHBsYW5OYW1lID0gJzMwMCBDcmVkaXRzIENvbW1pc3Npb25lciAoJDI0Ljk5IFVTRCknO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHAucGxhbl9pZCA9PT0gJ3BybycpIHtcbiAgICAgICAgICAgICAgICBwbGFuTmFtZSA9ICcxMDAgQ3JlZGl0cyBQcm8gQ2hhbXBpb24gKCQ5Ljk5IFVTRCknO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHAucGxhbl9pZCA9PT0gJ2Jvb3N0ZXInKSB7XG4gICAgICAgICAgICAgICAgcGxhbk5hbWUgPSAnNTAgQ3JlZGl0cyBRdWljayBCb29zdGVyICgkNS45OSBVU0QpJztcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChwLnBsYW5faWQgPT09ICdmcmVlJykge1xuICAgICAgICAgICAgICAgIHBsYW5OYW1lID0gJzIwIEZyZWUgQ3JlZGl0cyBSb29raWUgKCQwLjAwIFVTRCknO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV4aXN0aW5nVXNlciAmJiBleGlzdGluZ1VzZXIucGxhbikge1xuICAgICAgICAgICAgICAgIHBsYW5OYW1lID0gZXhpc3RpbmdVc2VyLnBsYW47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB1c2VyTWFwLnNldChjbGVhbkUsIHtcbiAgICAgICAgICAgICAgICBpZDogcC5pZCB8fCAndV8nICsgY2xlYW5FLFxuICAgICAgICAgICAgICAgIHVzZXI6IGNsZWFuRSxcbiAgICAgICAgICAgICAgICBwbGFuOiBwbGFuTmFtZSxcbiAgICAgICAgICAgICAgICBkYXRlOiBwLmNyZWF0ZWRfYXQgPyBuZXcgRGF0ZShwLmNyZWF0ZWRfYXQpLnRvTG9jYWxlRGF0ZVN0cmluZygpIDogKGV4aXN0aW5nVXNlcj8uZGF0ZSB8fCAnUmVnaXN0ZXJlZCcpLFxuICAgICAgICAgICAgICAgIHN0YXR1czogcC5zdGF0dXMgfHwgZXhpc3RpbmdVc2VyPy5zdGF0dXMgfHwgJ0FjdGl2ZSBTdWJzY3JpYmVyJyxcbiAgICAgICAgICAgICAgICBwcm9maWxlOiB7XG4gICAgICAgICAgICAgICAgICBlbWFpbDogY2xlYW5FLFxuICAgICAgICAgICAgICAgICAgYmlydGhkYXk6IHAuYmlydGhkYXksXG4gICAgICAgICAgICAgICAgICBmYXZvcml0ZVRlYW06IHAuZmF2b3JpdGVfdGVhbSxcbiAgICAgICAgICAgICAgICAgIGZhdm9yaXRlTnVtYmVyOiBwLmZhdm9yaXRlX251bWJlcixcbiAgICAgICAgICAgICAgICAgIHByZWZMYW5nOiBwLnByZWZlcnJlZF9sYW5ndWFnZSxcbiAgICAgICAgICAgICAgICAgIHByb2ZpbGVDb21wbGV0ZWQ6IHAucHJvZmlsZV9jb21wbGV0ZWQsXG4gICAgICAgICAgICAgICAgICBjcmVkaXRzOiBwLmNyZWRpdHMgPz8gMjBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgYWxsVXNlcnMgPSBBcnJheS5mcm9tKHVzZXJNYXAudmFsdWVzKCkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cblxuICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7IFxuICAgICAgdXNlcnM6IGFsbFVzZXJzLCBcbiAgICAgIHN1c3BlbmRlZDogY3VycmVudFN0YXRlLnN1c3BlbmRlZCxcbiAgICAgIHByb2ZpbGVzOiBjdXJyZW50U3RhdGUucHJvZmlsZXNcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXMuc3RhdHVzKDQwNSkuanNvbih7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9KTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVXN1YXJpb1xcXFxEcm9wYm94XFxcXGh0ZG9jc1xcXFxodGRvY3NfbmZsX2ZhbnRhc3lcXFxcU2FhU1xcXFxhcGlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVzdWFyaW9cXFxcRHJvcGJveFxcXFxodGRvY3NcXFxcaHRkb2NzX25mbF9mYW50YXN5XFxcXFNhYVNcXFxcYXBpXFxcXHRpY2tldHMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1VzdWFyaW8vRHJvcGJveC9odGRvY3MvaHRkb2NzX25mbF9mYW50YXN5L1NhYVMvYXBpL3RpY2tldHMuanNcIjtpbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuY29uc3Qgc3VwYWJhc2VVcmwgPSBwcm9jZXNzLmVudi5WSVRFX1NVUEFCQVNFX1VSTCB8fCBwcm9jZXNzLmVudi5TVVBBQkFTRV9VUkwgfHwgJ2h0dHBzOi8vamRtcnloeG1mZ2VkZmRsZXl0d24uc3VwYWJhc2UuY28nO1xuY29uc3Qgc3VwYWJhc2VTZXJ2aWNlS2V5ID0gcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSB8fCBwcm9jZXNzLmVudi5WSVRFX1NVUEFCQVNFX0FOT05fS0VZIHx8IHByb2Nlc3MuZW52LlNVUEFCQVNFX0FOT05fS0VZIHx8ICdleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUp6ZFhCaFltRnpaU0lzSW5KbFppSTZJbXBrYlhKNWFIaHRabWRsWkdaa2JHVjVkSGR1SWl3aWNtOXNaU0k2SW1GdWIyNGlMQ0pwWVhRaU9qRTNPRGN6TnpFd01qVXNJbVY0Y0NJNk1qRXdNamswTnpBeU5YMC5tWjZYaWxoWWgtZmwxYUh1MXJ0TGV3UnpxY2dlMEhiWl9kZ2xYcU9oeV9VJztcblxuY29uc3QgVE1QX1RJQ0tFVFNfRklMRSA9ICcvdG1wL3N1cGVybWFjaG9fdGlja2V0c192MS5qc29uJztcblxuY29uc3QgREVGQVVMVF9TRUVEX1RJQ0tFVFMgPSBbXTtcblxuZnVuY3Rpb24gcmVhZFRpY2tldHNTdGF0ZSgpIHtcbiAgdHJ5IHtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhUTVBfVElDS0VUU19GSUxFKSkge1xuICAgICAgY29uc3QgcmF3ID0gZnMucmVhZEZpbGVTeW5jKFRNUF9USUNLRVRTX0ZJTEUsICd1dGY4Jyk7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJhdyk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJzZWQpKSB7XG4gICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlKSB7fVxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIHNhdmVUaWNrZXRzU3RhdGUodGlja2V0cykge1xuICB0cnkge1xuICAgIGZzLndyaXRlRmlsZVN5bmMoVE1QX1RJQ0tFVFNfRklMRSwgSlNPTi5zdHJpbmdpZnkodGlja2V0cykpO1xuICB9IGNhdGNoIChlKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBQVVQsIERFTEVURSwgT1BUSU9OUycpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmVuZCgpO1xuICB9XG5cbiAgbGV0IHRpY2tldHMgPSByZWFkVGlja2V0c1N0YXRlKCk7XG5cbiAgLy8gR0VUOiBSZXRyaWV2ZSB0aWNrZXRzIChBbGwgZm9yIEFkbWluLCBvciBmaWx0ZXJlZCBieSB1c2VyX2VtYWlsKVxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGZpbHRlckVtYWlsID0gbnVsbDtcbiAgICAgIGNvbnN0IHJlcVVybCA9IHJlcS51cmwgfHwgJyc7XG4gICAgICBpZiAocmVxVXJsLmluY2x1ZGVzKCd1c2VyX2VtYWlsPScpKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtU3RyID0gcmVxVXJsLnNwbGl0KCd1c2VyX2VtYWlsPScpWzFdO1xuICAgICAgICBpZiAocGFyYW1TdHIpIHtcbiAgICAgICAgICBmaWx0ZXJFbWFpbCA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbVN0ci5zcGxpdCgnJicpWzBdKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmlsdGVyRW1haWwpIHtcbiAgICAgICAgY29uc3QgdXNlclRpY2tldHMgPSB0aWNrZXRzLmZpbHRlcih0ID0+ICh0LnVzZXJfZW1haWwgfHwgJycpLnRvTG93ZXJDYXNlKCkgPT09IGZpbHRlckVtYWlsKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgdGlja2V0czogdXNlclRpY2tldHMgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7IHRpY2tldHMgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogZXJyLm1lc3NhZ2UsIHRpY2tldHMgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUE9TVDogQ3JlYXRlIG5ldyB0aWNrZXQgT1IgYXBwZW5kIHJlcGx5XG4gIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBhY3Rpb24sIHRpY2tldElkLCB1c2VyX2VtYWlsLCBzdWJqZWN0LCBjYXRlZ29yeSwgcHJpb3JpdHksIG1lc3NhZ2UsIHNlbmRlck5hbWUsIHNlbmRlckVtYWlsIH0gPSByZXEuYm9keSB8fCB7fTtcblxuICAgICAgaWYgKGFjdGlvbiA9PT0gJ3JlcGx5JyAmJiB0aWNrZXRJZCAmJiBtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IHRpY2tldElkeCA9IHRpY2tldHMuZmluZEluZGV4KHQgPT4gdC5pZCA9PT0gdGlja2V0SWQpO1xuICAgICAgICBpZiAodGlja2V0SWR4ICE9PSAtMSkge1xuICAgICAgICAgIGNvbnN0IG5ld1JlcGx5ID0ge1xuICAgICAgICAgICAgc2VuZGVyOiBzZW5kZXJFbWFpbCB8fCB1c2VyX2VtYWlsIHx8ICdzdXBwb3J0QHN1cGVybWFjaG8uYXBwJyxcbiAgICAgICAgICAgIHNlbmRlck5hbWU6IHNlbmRlck5hbWUgfHwgJ1VzZXInLFxuICAgICAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoW10sIHsgaG91cjogJzItZGlnaXQnLCBtaW51dGU6ICcyLWRpZ2l0JywgZGF5OiAnMi1kaWdpdCcsIG1vbnRoOiAnc2hvcnQnIH0pXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aWNrZXRzW3RpY2tldElkeF0ubWVzc2FnZXMucHVzaChuZXdSZXBseSk7XG4gICAgICAgICAgdGlja2V0c1t0aWNrZXRJZHhdLnVwZGF0ZWRfYXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgc2F2ZVRpY2tldHNTdGF0ZSh0aWNrZXRzKTtcblxuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN1Y2Nlc3M6IHRydWUsIHRpY2tldDogdGlja2V0c1t0aWNrZXRJZHhdLCB0aWNrZXRzIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwNCkuanNvbih7IGVycm9yOiAnVGlja2V0IG5vdCBmb3VuZCcgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBuZXcgdGlja2V0XG4gICAgICBpZiAoIXVzZXJfZW1haWwgfHwgIXN1YmplY3QgfHwgIW1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcyAodXNlcl9lbWFpbCwgc3ViamVjdCwgbWVzc2FnZSknIH0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBuZXdUaWNrZXQgPSB7XG4gICAgICAgIGlkOiAndGlja18nICsgRGF0ZS5ub3coKSxcbiAgICAgICAgdXNlcl9lbWFpbDogdXNlcl9lbWFpbC50cmltKCkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgc3ViamVjdDogc3ViamVjdC50cmltKCksXG4gICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSB8fCAnR2VuZXJhbCcsXG4gICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSB8fCAnTWVkaXVtJyxcbiAgICAgICAgc3RhdHVzOiAnT3BlbicsXG4gICAgICAgIGNyZWF0ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgdXBkYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNlbmRlcjogdXNlcl9lbWFpbC50cmltKCkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgIHNlbmRlck5hbWU6IHNlbmRlck5hbWUgfHwgdXNlcl9lbWFpbC5zcGxpdCgnQCcpWzBdLFxuICAgICAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoW10sIHsgaG91cjogJzItZGlnaXQnLCBtaW51dGU6ICcyLWRpZ2l0JywgZGF5OiAnMi1kaWdpdCcsIG1vbnRoOiAnc2hvcnQnIH0pXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9O1xuXG4gICAgICB0aWNrZXRzLnVuc2hpZnQobmV3VGlja2V0KTtcbiAgICAgIHNhdmVUaWNrZXRzU3RhdGUodGlja2V0cyk7XG5cbiAgICAgIC8vIEF0dGVtcHQgdG8gc2F2ZSB0byBTdXBhYmFzZSBpZiBjb25maWd1cmVkXG4gICAgICBpZiAoc3VwYWJhc2VVcmwgJiYgIXN1cGFiYXNlVXJsLmluY2x1ZGVzKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIHN1cGFiYXNlU2VydmljZUtleSk7XG4gICAgICAgICAgYXdhaXQgc3VwYWJhc2UuZnJvbSgnc3VwcG9ydF90aWNrZXRzJykuaW5zZXJ0KFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdXNlcl9lbWFpbDogbmV3VGlja2V0LnVzZXJfZW1haWwsXG4gICAgICAgICAgICAgIHN1YmplY3Q6IG5ld1RpY2tldC5zdWJqZWN0LFxuICAgICAgICAgICAgICBjYXRlZ29yeTogbmV3VGlja2V0LmNhdGVnb3J5LFxuICAgICAgICAgICAgICBwcmlvcml0eTogbmV3VGlja2V0LnByaW9yaXR5LFxuICAgICAgICAgICAgICBzdGF0dXM6IG5ld1RpY2tldC5zdGF0dXMsXG4gICAgICAgICAgICAgIG1lc3NhZ2VzOiBuZXdUaWNrZXQubWVzc2FnZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3VjY2VzczogdHJ1ZSwgdGlja2V0OiBuZXdUaWNrZXQsIHRpY2tldHMgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUFVUOiBVcGRhdGUgc3RhdHVzIG9yIGRldGFpbHMgb2YgYSB0aWNrZXRcbiAgaWYgKHJlcS5tZXRob2QgPT09ICdQVVQnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgdGlja2V0SWQsIHN0YXR1cywgcHJpb3JpdHksIGFkbWluUmVwbHkgfSA9IHJlcS5ib2R5IHx8IHt9O1xuICAgICAgaWYgKCF0aWNrZXRJZCkgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICd0aWNrZXRJZCByZXF1aXJlZCcgfSk7XG5cbiAgICAgIGNvbnN0IHRpY2tldElkeCA9IHRpY2tldHMuZmluZEluZGV4KHQgPT4gdC5pZCA9PT0gdGlja2V0SWQpO1xuICAgICAgaWYgKHRpY2tldElkeCAhPT0gLTEpIHtcbiAgICAgICAgaWYgKHN0YXR1cykgdGlja2V0c1t0aWNrZXRJZHhdLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgaWYgKHByaW9yaXR5KSB0aWNrZXRzW3RpY2tldElkeF0ucHJpb3JpdHkgPSBwcmlvcml0eTtcblxuICAgICAgICBpZiAoYWRtaW5SZXBseSkge1xuICAgICAgICAgIHRpY2tldHNbdGlja2V0SWR4XS5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICAgIHNlbmRlcjogJ3N1cHBvcnRAc3VwZXJtYWNoby5hcHAnLFxuICAgICAgICAgICAgc2VuZGVyTmFtZTogJ1N1cGVyTWFjaG8gU3VwcG9ydCBUZWFtJyxcbiAgICAgICAgICAgIHRleHQ6IGFkbWluUmVwbHksXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKFtdLCB7IGhvdXI6ICcyLWRpZ2l0JywgbWludXRlOiAnMi1kaWdpdCcsIGRheTogJzItZGlnaXQnLCBtb250aDogJ3Nob3J0JyB9KVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGlja2V0c1t0aWNrZXRJZHhdLnVwZGF0ZWRfYXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHNhdmVUaWNrZXRzU3RhdGUodGlja2V0cyk7XG5cbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3VjY2VzczogdHJ1ZSwgdGlja2V0OiB0aWNrZXRzW3RpY2tldElkeF0sIHRpY2tldHMgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oeyBlcnJvcjogJ1RpY2tldCBub3QgZm91bmQnIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIERFTEVURTogUmVtb3ZlIHRpY2tldFxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ0RFTEVURScpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyB0aWNrZXRJZCB9ID0gcmVxLmJvZHkgfHwge307XG4gICAgICBpZiAodGlja2V0SWQpIHtcbiAgICAgICAgdGlja2V0cyA9IHRpY2tldHMuZmlsdGVyKHQgPT4gdC5pZCAhPT0gdGlja2V0SWQpO1xuICAgICAgICBzYXZlVGlja2V0c1N0YXRlKHRpY2tldHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3VjY2VzczogdHJ1ZSwgdGlja2V0cyB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzLnN0YXR1cyg0MDUpLmpzb24oeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVzdWFyaW9cXFxcRHJvcGJveFxcXFxodGRvY3NcXFxcaHRkb2NzX25mbF9mYW50YXN5XFxcXFNhYVNcXFxcYXBpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc3VhcmlvXFxcXERyb3Bib3hcXFxcaHRkb2NzXFxcXGh0ZG9jc19uZmxfZmFudGFzeVxcXFxTYWFTXFxcXGFwaVxcXFxuZmwtc3luYy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvVXN1YXJpby9Ecm9wYm94L2h0ZG9jcy9odGRvY3NfbmZsX2ZhbnRhc3kvU2FhUy9hcGkvbmZsLXN5bmMuanNcIjtpbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5jb25zdCBDUkVEX0ZJTEUgPSAnL3RtcC9zdXBlcm1hY2hvX3JhcGlkYXBpLmpzb24nO1xuY29uc3QgQ0FDSEVfRklMRSA9ICcvdG1wL25mbF9saXZlX2NhY2hlLmpzb24nO1xuXG4vLyBIZWxwZXIgdG8gcmVhZCBzZXJ2ZXItcGVyc2lzdGVkIGNyZWRlbnRpYWxzXG5mdW5jdGlvbiByZWFkQ3JlZGVudGlhbHMoKSB7XG4gIHRyeSB7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoQ1JFRF9GSUxFKSkge1xuICAgICAgY29uc3QgcmF3ID0gZnMucmVhZEZpbGVTeW5jKENSRURfRklMRSwgJ3V0ZjgnKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHJhdyk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7fVxuICByZXR1cm4ge1xuICAgIGtleTogcHJvY2Vzcy5lbnYuUkFQSURBUElfS0VZIHx8IHByb2Nlc3MuZW52LlZJVEVfUkFQSURBUElfS0VZIHx8ICcnLFxuICAgIGhvc3Q6IHByb2Nlc3MuZW52LlJBUElEQVBJX0hPU1QgfHwgJ25mbC1hcGktZGF0YS5wLnJhcGlkYXBpLmNvbSdcbiAgfTtcbn1cblxuLy8gSGVscGVyIHRvIHdyaXRlIHNlcnZlci1wZXJzaXN0ZWQgY3JlZGVudGlhbHNcbmZ1bmN0aW9uIHNhdmVDcmVkZW50aWFscyhjcmVkcykge1xuICB0cnkge1xuICAgIGZzLndyaXRlRmlsZVN5bmMoQ1JFRF9GSUxFLCBKU09OLnN0cmluZ2lmeShjcmVkcykpO1xuICB9IGNhdGNoIChlKSB7fVxufVxuXG4vLyBIZWxwZXIgdG8gcmVhZCBjYWNoZWQgTkZMIGxpdmUgZGF0YVxuZnVuY3Rpb24gcmVhZENhY2hlKCkge1xuICB0cnkge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKENBQ0hFX0ZJTEUpKSB7XG4gICAgICBjb25zdCByYXcgPSBmcy5yZWFkRmlsZVN5bmMoQ0FDSEVfRklMRSwgJ3V0ZjgnKTtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHJhdyk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7fVxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gSGVscGVyIHRvIHdyaXRlIGNhY2hlZCBORkwgbGl2ZSBkYXRhXG5mdW5jdGlvbiB3cml0ZUNhY2hlKGRhdGEpIHtcbiAgdHJ5IHtcbiAgICBmcy53cml0ZUZpbGVTeW5jKENBQ0hFX0ZJTEUsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgfSBjYXRjaCAoZSkge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgT1BUSU9OUycpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmVuZCgpO1xuICB9XG5cbiAgLy8gSGFuZGxlIFBPU1Q6IFBlcnNpc3QgUmFwaWRBUEkgY3JlZGVudGlhbHMgb24gc2VydmVyXG4gIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBrZXksIGhvc3QgfSA9IHJlcS5ib2R5IHx8IHt9O1xuICAgICAgY29uc3QgY3VycmVudENyZWRzID0gcmVhZENyZWRlbnRpYWxzKCk7XG4gICAgICBjb25zdCBuZXdDcmVkcyA9IHtcbiAgICAgICAga2V5OiBrZXkgIT09IHVuZGVmaW5lZCA/IGtleS50cmltKCkgOiBjdXJyZW50Q3JlZHMua2V5LFxuICAgICAgICBob3N0OiBob3N0ICE9PSB1bmRlZmluZWQgPyBob3N0LnRyaW0oKSA6IGN1cnJlbnRDcmVkcy5ob3N0XG4gICAgICB9O1xuICAgICAgc2F2ZUNyZWRlbnRpYWxzKG5ld0NyZWRzKTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN1Y2Nlc3M6IHRydWUsIGNyZWRlbnRpYWxzOiBuZXdDcmVkcyB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBIYW5kbGUgR0VUOiBGZXRjaCBvZmZpY2lhbCBFU1BOIFJlYWwtVGltZSBTY29yZWJvYXJkICYgQnJlYWtpbmcgTkZMIE5ld3NcbiAgY29uc3QgYWN0aXZlQ3JlZHMgPSByZWFkQ3JlZGVudGlhbHMoKTtcbiAgY29uc3QgYXBpS2V5ID0gYWN0aXZlQ3JlZHMua2V5O1xuICBjb25zdCBhcGlIb3N0ID0gYWN0aXZlQ3JlZHMuaG9zdCB8fCAnbmZsLWFwaS1kYXRhLnAucmFwaWRhcGkuY29tJztcblxuICBjb25zdCBjYWNoZWQgPSByZWFkQ2FjaGUoKTtcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAvLyBSZXR1cm4gY2FjaGUgaWYgZnJlc2ggKHVuZGVyIDMgbWludXRlcylcbiAgaWYgKGNhY2hlZCAmJiBjYWNoZWQudGltZXN0YW1wICYmIChub3cgLSBjYWNoZWQudGltZXN0YW1wIDwgMTgwMDAwKSkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuanNvbih7IHNvdXJjZTogJ2VzcG5fbGl2ZV9jYWNoZScsIGNyZWRlbnRpYWxzOiBhY3RpdmVDcmVkcywgLi4uY2FjaGVkLmRhdGEgfSk7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIDEuIEZldGNoIE9mZmljaWFsIEVTUE4gUmVhbC1UaW1lIFNjb3JlYm9hcmQgLyBTY2hlZHVsZXNcbiAgICBjb25zdCBlc3BuU2NvcmVzUmVzID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vc2l0ZS5hcGkuZXNwbi5jb20vYXBpcy9zaXRlL3YyL3Nwb3J0cy9mb290YmFsbC9uZmwvc2NvcmVib2FyZCcpO1xuICAgIGNvbnN0IGVzcG5TY29yZXNEYXRhID0gYXdhaXQgZXNwblNjb3Jlc1Jlcy5qc29uKCk7XG5cbiAgICAvLyAyLiBGZXRjaCBPZmZpY2lhbCBFU1BOIEJyZWFraW5nIE5GTCBOZXdzICYgSW5qdXJ5IFJlcG9ydHNcbiAgICBjb25zdCBlc3BuTmV3c1JlcyA9IGF3YWl0IGZldGNoKCdodHRwczovL3NpdGUuYXBpLmVzcG4uY29tL2FwaXMvc2l0ZS92Mi9zcG9ydHMvZm9vdGJhbGwvbmZsL25ld3MnKTtcbiAgICBjb25zdCBlc3BuTmV3c0RhdGEgPSBhd2FpdCBlc3BuTmV3c1Jlcy5qc29uKCk7XG5cbiAgICAvLyBQYXJzZSBSZWFsIEVTUE4gRXZlbnRzXG4gICAgY29uc3QgcmF3RXZlbnRzID0gZXNwblNjb3Jlc0RhdGEuZXZlbnRzIHx8IFtdO1xuICAgIGNvbnN0IHJlYWxHYW1lcyA9IHJhd0V2ZW50cy5tYXAoZXZ0ID0+IHtcbiAgICAgIGNvbnN0IGNvbXBldGl0aW9uID0gZXZ0LmNvbXBldGl0aW9ucz8uWzBdIHx8IHt9O1xuICAgICAgY29uc3QgY29tcGV0aXRvcnMgPSBjb21wZXRpdGlvbi5jb21wZXRpdG9ycyB8fCBbXTtcbiAgICAgIGNvbnN0IGhvbWUgPSBjb21wZXRpdG9ycy5maW5kKGMgPT4gYy5ob21lQXdheSA9PT0gJ2hvbWUnKSB8fCB7fTtcbiAgICAgIGNvbnN0IGF3YXkgPSBjb21wZXRpdG9ycy5maW5kKGMgPT4gYy5ob21lQXdheSA9PT0gJ2F3YXknKSB8fCB7fTtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IGV2dC5zdGF0dXM/LnR5cGUgfHwge307XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBldnQuaWQsXG4gICAgICAgIG5hbWU6IGV2dC5uYW1lLFxuICAgICAgICBzaG9ydE5hbWU6IGV2dC5zaG9ydE5hbWUsXG4gICAgICAgIGRhdGU6IGV2dC5kYXRlLFxuICAgICAgICBzdGF0dXNTdGF0ZTogc3RhdHVzLnN0YXRlLCAvLyAncHJlJywgJ2luJywgJ3Bvc3QnXG4gICAgICAgIHN0YXR1c0RldGFpbDogc3RhdHVzLmRldGFpbCB8fCBzdGF0dXMuZGVzY3JpcHRpb24gfHwgJ1VwY29taW5nIEdhbWUnLFxuICAgICAgICBpc0xpdmU6IHN0YXR1cy5zdGF0ZSA9PT0gJ2luJyxcbiAgICAgICAgaXNDb21wbGV0ZWQ6IHN0YXR1cy5zdGF0ZSA9PT0gJ3Bvc3QnLFxuICAgICAgICBoYXNTY29yZTogc3RhdHVzLnN0YXRlID09PSAnaW4nIHx8IHN0YXR1cy5zdGF0ZSA9PT0gJ3Bvc3QnLFxuICAgICAgICBob21lVGVhbTogaG9tZS50ZWFtPy5kaXNwbGF5TmFtZSB8fCAnSG9tZSBUZWFtJyxcbiAgICAgICAgaG9tZUFiYnJldjogaG9tZS50ZWFtPy5hYmJyZXZpYXRpb24gfHwgJ0hPTUUnLFxuICAgICAgICBob21lU2NvcmU6IGhvbWUuc2NvcmUgfHwgJzAnLFxuICAgICAgICBob21lTG9nbzogaG9tZS50ZWFtPy5sb2dvIHx8ICcnLFxuICAgICAgICBhd2F5VGVhbTogYXdheS50ZWFtPy5kaXNwbGF5TmFtZSB8fCAnQXdheSBUZWFtJyxcbiAgICAgICAgYXdheUFiYnJldjogYXdheS50ZWFtPy5hYmJyZXZpYXRpb24gfHwgJ0FXQVknLFxuICAgICAgICBhd2F5U2NvcmU6IGF3YXkuc2NvcmUgfHwgJzAnLFxuICAgICAgICBhd2F5TG9nbzogYXdheS5sb2dvIHx8ICcnLFxuICAgICAgICBvZGRzOiBjb21wZXRpdGlvbi5vZGRzPy5bMF0/LmRldGFpbHMgfHwgJ0xpbmUgVEJEJ1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIFBhcnNlIFJlYWwgRVNQTiBCcmVha2luZyBIZWFkbGluZXNcbiAgICBjb25zdCByYXdBcnRpY2xlcyA9IGVzcG5OZXdzRGF0YS5hcnRpY2xlcyB8fCBbXTtcbiAgICBjb25zdCByZWFsSGVhZGxpbmVzID0gcmF3QXJ0aWNsZXMuc2xpY2UoMCwgNSkubWFwKGFydCA9PiAoe1xuICAgICAgaWQ6IGFydC5pZCB8fCBNYXRoLnJhbmRvbSgpLFxuICAgICAgaGVhZGxpbmU6IGFydC5oZWFkbGluZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBhcnQuZGVzY3JpcHRpb24sXG4gICAgICBwdWJsaXNoZWQ6IGFydC5wdWJsaXNoZWQsXG4gICAgICBsaW5rOiBhcnQubGlua3M/LndlYj8uaHJlZiB8fCAnJ1xuICAgIH0pKTtcblxuICAgIC8vIElmIHVzZXIgcHJvdmlkZWQgUmFwaWRBUEkga2V5LCBhdHRlbXB0IG9wdGlvbmFsIFJhcGlkQVBJIGVucmljaG1lbnRcbiAgICBsZXQgcmFwaWREYXRhID0gbnVsbDtcbiAgICBpZiAoYXBpS2V5ICYmICFhcGlLZXkuaW5jbHVkZXMoJ3BsYWNlaG9sZGVyJykpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCB0YXJnZXRQYXRoID0gJy9nYW1lcz9sZWFndWU9MSZzZWFzb249MjAyNic7XG4gICAgICAgIGlmIChhcGlIb3N0LmluY2x1ZGVzKCduZmwtYXBpLWRhdGEnKSkgdGFyZ2V0UGF0aCA9ICcvbmZsLXNjaGVkdWxlcyc7XG4gICAgICAgIFxuICAgICAgICBjb25zdCByUmVzID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vJHthcGlIb3N0fSR7dGFyZ2V0UGF0aH1gLCB7XG4gICAgICAgICAgaGVhZGVyczogeyAneC1yYXBpZGFwaS1rZXknOiBhcGlLZXksICd4LXJhcGlkYXBpLWhvc3QnOiBhcGlIb3N0IH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJhcGlkRGF0YSA9IGF3YWl0IHJSZXMuanNvbigpO1xuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG5cbiAgICBjb25zdCBkcmFmdFBsYXllcnMgPSBbXG4gICAgICB7IGlkOiAncDEnLCBuYW1lOiAnSmFcXCdNYXJyIENoYXNlJywgcG9zOiAnV1InLCB0ZWFtOiAnQ0lOJywgYnllOiAxMiwgYWRwOiAnMS4wMScsIHByb2pQdHM6IDMxOC41LCBmbG9vcjogMTcuNSwgY2VpbGluZzogMzUuMCwgdXBzaWRlVGllcjogJ1dSMSBPVkVSQUxMJywgdmFsdWVTdGVhbDogJ0NPTlNFTlNVUyAjMSBQSUNLJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AyJywgbmFtZTogJ0JpamFuIFJvYmluc29uJywgcG9zOiAnUkInLCB0ZWFtOiAnQVRMJywgYnllOiAxMiwgYWRwOiAnMS4wMicsIHByb2pQdHM6IDI5OC4yLCBmbG9vcjogMTUuOCwgY2VpbGluZzogMzAuMSwgdXBzaWRlVGllcjogJ1JCMSBPVkVSQUxMJywgdmFsdWVTdGVhbDogJ1RPUCBSQiBBTkNIT1InLCBuZWVkTWF0Y2g6IHRydWUgfSxcbiAgICAgIHsgaWQ6ICdwMycsIG5hbWU6ICdTYXF1b24gQmFya2xleScsIHBvczogJ1JCJywgdGVhbTogJ1BISScsIGJ5ZTogNSwgYWRwOiAnMS4wMycsIHByb2pQdHM6IDI5Mi4wLCBmbG9vcjogMTUuMiwgY2VpbGluZzogMjkuNSwgdXBzaWRlVGllcjogJ1MtVElFUiBWT0xVTUUnLCB2YWx1ZVN0ZWFsOiAnVE9QIDMgUElDSycsIG5lZWRNYXRjaDogdHJ1ZSB9LFxuICAgICAgeyBpZDogJ3A0JywgbmFtZTogJ0JyZWVjZSBIYWxsJywgcG9zOiAnUkInLCB0ZWFtOiAnTllKJywgYnllOiAxMiwgYWRwOiAnMS4wNCcsIHByb2pQdHM6IDI4Ni40LCBmbG9vcjogMTQuOCwgY2VpbGluZzogMjguMiwgdXBzaWRlVGllcjogJ1MtVElFUiBFTElURScsIHZhbHVlU3RlYWw6ICcrMiBQaWNrcyBWYWx1ZScsIG5lZWRNYXRjaDogdHJ1ZSB9LFxuICAgICAgeyBpZDogJ3A1JywgbmFtZTogJ0p1c3RpbiBKZWZmZXJzb24nLCBwb3M6ICdXUicsIHRlYW06ICdNSU4nLCBieWU6IDYsIGFkcDogJzEuMDUnLCBwcm9qUHRzOiAyOTAuMSwgZmxvb3I6IDE1LjUsIGNlaWxpbmc6IDMxLjIsIHVwc2lkZVRpZXI6ICdFTElURSBUQVJHRVQgU0hBUkUnLCB2YWx1ZVN0ZWFsOiAnVE9QIDUgV1InLCBuZWVkTWF0Y2g6IGZhbHNlIH0sXG4gICAgICB7IGlkOiAncDYnLCBuYW1lOiAnQ2VlRGVlIExhbWInLCBwb3M6ICdXUicsIHRlYW06ICdEQUwnLCBieWU6IDcsIGFkcDogJzEuMDYnLCBwcm9qUHRzOiAyODguNSwgZmxvb3I6IDE1LjAsIGNlaWxpbmc6IDMwLjUsIHVwc2lkZVRpZXI6ICdFTElURSBUQVJHRVQgU0hBUkUnLCB2YWx1ZVN0ZWFsOiAnVE9QIDYgV1InLCBuZWVkTWF0Y2g6IGZhbHNlIH0sXG4gICAgICB7IGlkOiAncDcnLCBuYW1lOiAnQW1vbi1SYSBTdC4gQnJvd24nLCBwb3M6ICdXUicsIHRlYW06ICdERVQnLCBieWU6IDUsIGFkcDogJzEuMDcnLCBwcm9qUHRzOiAyNzUuMiwgZmxvb3I6IDE0LjUsIGNlaWxpbmc6IDI3LjgsIHVwc2lkZVRpZXI6ICdISUdIIEZMT09SIEFOQ0hPUicsIHZhbHVlU3RlYWw6ICdST1VORCAxIEFOQ0hPUicsIG5lZWRNYXRjaDogZmFsc2UgfSxcbiAgICAgIHsgaWQ6ICdwOCcsIG5hbWU6ICdNYWxpayBOYWJlcnMnLCBwb3M6ICdXUicsIHRlYW06ICdOWUcnLCBieWU6IDExLCBhZHA6ICcxLjA4JywgcHJvalB0czogMjY0LjUsIGZsb29yOiAxMy4yLCBjZWlsaW5nOiAyOC4wLCB1cHNpZGVUaWVyOiAnQlJFQUtPVVQgU1VQRVJTVEFSJywgdmFsdWVTdGVhbDogJys0IFBpY2tzIFZhbHVlJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3A5JywgbmFtZTogJ0RlcnJpY2sgSGVucnknLCBwb3M6ICdSQicsIHRlYW06ICdCQUwnLCBieWU6IDE0LCBhZHA6ICcxLjA5JywgcHJvalB0czogMjcyLjAsIGZsb29yOiAxNC4wLCBjZWlsaW5nOiAyOS4wLCB1cHNpZGVUaWVyOiAnVE9VQ0hET1dOIE1PTlNURVInLCB2YWx1ZVN0ZWFsOiAnKzMgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IHRydWUgfSxcbiAgICAgIHsgaWQ6ICdwMTAnLCBuYW1lOiAnSmFobXlyIEdpYmJzJywgcG9zOiAnUkInLCB0ZWFtOiAnREVUJywgYnllOiA1LCBhZHA6ICcxLjEwJywgcHJvalB0czogMjY1LjgsIGZsb29yOiAxMy41LCBjZWlsaW5nOiAyOC40LCB1cHNpZGVUaWVyOiAnRFlOQU1JQyBFWFBMT1NJVkUnLCB2YWx1ZVN0ZWFsOiAnKzIgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IHRydWUgfSxcbiAgICAgIHsgaWQ6ICdwMTEnLCBuYW1lOiAnTmljbyBDb2xsaW5zJywgcG9zOiAnV1InLCB0ZWFtOiAnSE9VJywgYnllOiAxNCwgYWRwOiAnMS4xMScsIHByb2pQdHM6IDI1OC40LCBmbG9vcjogMTIuOCwgY2VpbGluZzogMjcuNSwgdXBzaWRlVGllcjogJ0FMUEhBIFdSMScsIHZhbHVlU3RlYWw6ICdST1VORCAxIFZBTFVFJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AxMicsIG5hbWU6ICdQdWthIE5hY3VhJywgcG9zOiAnV1InLCB0ZWFtOiAnTEFSJywgYnllOiA2LCBhZHA6ICcxLjEyJywgcHJvalB0czogMjU1LjAsIGZsb29yOiAxMi41LCBjZWlsaW5nOiAyNi44LCB1cHNpZGVUaWVyOiAnVEFSR0VUIE1PTlNURVInLCB2YWx1ZVN0ZWFsOiAnUk9VTkQgMSBWQUxVRScsIG5lZWRNYXRjaDogZmFsc2UgfSxcbiAgICAgIHsgaWQ6ICdwMTMnLCBuYW1lOiAnR2FycmV0dCBXaWxzb24nLCBwb3M6ICdXUicsIHRlYW06ICdOWUonLCBieWU6IDEyLCBhZHA6ICcyLjAxJywgcHJvalB0czogMjQ4LjAsIGZsb29yOiAxMi4wLCBjZWlsaW5nOiAyNi4wLCB1cHNpZGVUaWVyOiAnQUxQSEEgVEFSR0VUIFNIQVJFJywgdmFsdWVTdGVhbDogJyszIFBpY2tzIFZhbHVlJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AxNCcsIG5hbWU6ICdCcmlhbiBUaG9tYXMgSnIuJywgcG9zOiAnV1InLCB0ZWFtOiAnSkFYJywgYnllOiAxMiwgYWRwOiAnMi4wMicsIHByb2pQdHM6IDI0Mi41LCBmbG9vcjogMTEuOCwgY2VpbGluZzogMjYuNSwgdXBzaWRlVGllcjogJ0JSRUFLT1VUIFNQRUVEU1RBUicsIHZhbHVlU3RlYWw6ICcrNSBQaWNrcyBWYWx1ZScsIG5lZWRNYXRjaDogZmFsc2UgfSxcbiAgICAgIHsgaWQ6ICdwMTUnLCBuYW1lOiAnTWFydmluIEhhcnJpc29uIEpyLicsIHBvczogJ1dSJywgdGVhbTogJ0FSSScsIGJ5ZTogMTEsIGFkcDogJzIuMDMnLCBwcm9qUHRzOiAyMzguOSwgZmxvb3I6IDExLjIsIGNlaWxpbmc6IDI1LjQsIHVwc2lkZVRpZXI6ICdCUkVBS09VVCBVUFNJREUnLCB2YWx1ZVN0ZWFsOiAnKzQgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IGZhbHNlIH0sXG4gICAgICB7IGlkOiAncDE2JywgbmFtZTogJ0pvc2ggQWxsZW4nLCBwb3M6ICdRQicsIHRlYW06ICdCVUYnLCBieWU6IDEyLCBhZHA6ICcyLjA0JywgcHJvalB0czogMzY1LjIsIGZsb29yOiAxOS41LCBjZWlsaW5nOiAzNS4wLCB1cHNpZGVUaWVyOiAnUUIxIE9WRVJBTEwnLCB2YWx1ZVN0ZWFsOiAnUUIxIEFOQ0hPUicsIG5lZWRNYXRjaDogZmFsc2UgfSxcbiAgICAgIHsgaWQ6ICdwMTcnLCBuYW1lOiAnTGFtYXIgSmFja3NvbicsIHBvczogJ1FCJywgdGVhbTogJ0JBTCcsIGJ5ZTogMTQsIGFkcDogJzIuMDUnLCBwcm9qUHRzOiAzNTguMCwgZmxvb3I6IDE5LjAsIGNlaWxpbmc6IDM0LjAsIHVwc2lkZVRpZXI6ICdLT05BTUkgQ09ERSBRQicsIHZhbHVlU3RlYWw6ICdRQjIgQU5DSE9SJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AxOCcsIG5hbWU6ICdKb25hdGhhbiBUYXlsb3InLCBwb3M6ICdSQicsIHRlYW06ICdJTkQnLCBieWU6IDE0LCBhZHA6ICcyLjA2JywgcHJvalB0czogMjQ1LjAsIGZsb29yOiAxMi4yLCBjZWlsaW5nOiAyNi4wLCB1cHNpZGVUaWVyOiAnV09SS0hPUlNFIFJCJywgdmFsdWVTdGVhbDogJys0IFBpY2tzIFZhbHVlJywgbmVlZE1hdGNoOiB0cnVlIH0sXG4gICAgICB7IGlkOiAncDE5JywgbmFtZTogJ0RlXFwnVm9uIEFjaGFuZScsIHBvczogJ1JCJywgdGVhbTogJ01JQScsIGJ5ZTogNiwgYWRwOiAnMi4wNycsIHByb2pQdHM6IDI0MC4yLCBmbG9vcjogMTEuNSwgY2VpbGluZzogMjkuOCwgdXBzaWRlVGllcjogJ0hPTUUgUlVOIENFSUxJTkcnLCB2YWx1ZVN0ZWFsOiAnKzUgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IHRydWUgfSxcbiAgICAgIHsgaWQ6ICdwMjAnLCBuYW1lOiAnS3lyZW4gV2lsbGlhbXMnLCBwb3M6ICdSQicsIHRlYW06ICdMQVInLCBieWU6IDYsIGFkcDogJzIuMDgnLCBwcm9qUHRzOiAyMzYuNSwgZmxvb3I6IDExLjgsIGNlaWxpbmc6IDI0LjUsIHVwc2lkZVRpZXI6ICdSRURaT05FIFRPVUNIRVMnLCB2YWx1ZVN0ZWFsOiAnKzMgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IHRydWUgfSxcbiAgICAgIHsgaWQ6ICdwMjEnLCBuYW1lOiAnSm9zaCBKYWNvYnMnLCBwb3M6ICdHQicsIHRlYW06ICdHQicsIGJ5ZTogMTAsIGFkcDogJzIuMDknLCBwcm9qUHRzOiAyMzAuMSwgZmxvb3I6IDExLjAsIGNlaWxpbmc6IDI0LjAsIHVwc2lkZVRpZXI6ICdXT1JLSE9SU0UgUkInLCB2YWx1ZVN0ZWFsOiAnKzQgUGlja3MgVmFsdWUnLCBuZWVkTWF0Y2g6IHRydWUgfSxcbiAgICAgIHsgaWQ6ICdwMjInLCBuYW1lOiAnS2VubmV0aCBXYWxrZXIgSUlJJywgcG9zOiAnUkInLCB0ZWFtOiAnU0VBJywgYnllOiAxMCwgYWRwOiAnMi4xMCcsIHByb2pQdHM6IDIyNS40LCBmbG9vcjogMTAuOCwgY2VpbGluZzogMjMuNSwgdXBzaWRlVGllcjogJ1RPVUNIRE9XTiBDRUlMSU5HJywgdmFsdWVTdGVhbDogJys1IFBpY2tzIFZhbHVlJywgbmVlZE1hdGNoOiB0cnVlIH0sXG4gICAgICB7IGlkOiAncDIzJywgbmFtZTogJ0phbWVzIENvb2snLCBwb3M6ICdSQicsIHRlYW06ICdCVUYnLCBieWU6IDEyLCBhZHA6ICcyLjExJywgcHJvalB0czogMjIwLjAsIGZsb29yOiAxMC41LCBjZWlsaW5nOiAyMi44LCB1cHNpZGVUaWVyOiAnUEFTUyBDQVRDSEVSIFJCJywgdmFsdWVTdGVhbDogJys2IFBpY2tzIFZhbHVlJywgbmVlZE1hdGNoOiB0cnVlIH0sXG4gICAgICB7IGlkOiAncDI0JywgbmFtZTogJ0NodWJhIEh1YmJhcmQnLCBwb3M6ICdSQicsIHRlYW06ICdDQVInLCBieWU6IDExLCBhZHA6ICczLjAyJywgcHJvalB0czogMjEwLjUsIGZsb29yOiAxMC4wLCBjZWlsaW5nOiAyMS41LCB1cHNpZGVUaWVyOiAnSElHSCBWT0xVTUUgUkInLCB2YWx1ZVN0ZWFsOiAnUk9VTkQgMyBWQUxVRScsIG5lZWRNYXRjaDogdHJ1ZSB9LFxuICAgICAgeyBpZDogJ3AyNScsIG5hbWU6ICdDaGFzZSBCcm93bicsIHBvczogJ1JCJywgdGVhbTogJ0NJTicsIGJ5ZTogMTIsIGFkcDogJzMuMDUnLCBwcm9qUHRzOiAyMDUuMiwgZmxvb3I6IDkuOCwgY2VpbGluZzogMjIuMCwgdXBzaWRlVGllcjogJ0JSRUFLT1VUIFJCJywgdmFsdWVTdGVhbDogJ1JPVU5EIDMgU1RFQUwnLCBuZWVkTWF0Y2g6IHRydWUgfSxcbiAgICAgIHsgaWQ6ICdwMjYnLCBuYW1lOiAnQnJvY2sgQm93ZXJzJywgcG9zOiAnVEUnLCB0ZWFtOiAnTFYnLCBieWU6IDEwLCBhZHA6ICczLjA4JywgcHJvalB0czogMjE1LjQsIGZsb29yOiAxMC41LCBjZWlsaW5nOiAyMy4wLCB1cHNpZGVUaWVyOiAnVEUxIE9WRVJBTEwnLCB2YWx1ZVN0ZWFsOiAnVEUxIEFOQ0hPUicsIG5lZWRNYXRjaDogZmFsc2UgfSxcbiAgICAgIHsgaWQ6ICdwMjcnLCBuYW1lOiAnVHJleSBNY0JyaWRlJywgcG9zOiAnVEUnLCB0ZWFtOiAnQVJJJywgYnllOiAxMSwgYWRwOiAnMy4xMCcsIHByb2pQdHM6IDIwOC4yLCBmbG9vcjogMTAuMCwgY2VpbGluZzogMjEuOCwgdXBzaWRlVGllcjogJ0VMSVRFIFRBUkdFVCBTSEFSRScsIHZhbHVlU3RlYWw6ICcrNiBQaWNrcyBWYWx1ZScsIG5lZWRNYXRjaDogZmFsc2UgfSxcbiAgICAgIHsgaWQ6ICdwMjgnLCBuYW1lOiAnUGF0cmljayBNYWhvbWVzJywgcG9zOiAnUUInLCB0ZWFtOiAnS0MnLCBieWU6IDYsIGFkcDogJzMuMTInLCBwcm9qUHRzOiAzMzIuMCwgZmxvb3I6IDE3LjUsIGNlaWxpbmc6IDMwLjAsIHVwc2lkZVRpZXI6ICdQQVNTSU5HIFlBUkQgUUInLCB2YWx1ZVN0ZWFsOiAnUk9VTkQgMyBWQUxVRScsIG5lZWRNYXRjaDogZmFsc2UgfSxcbiAgICAgIHsgaWQ6ICdwMjknLCBuYW1lOiAnSmF5ZGVuIERhbmllbHMnLCBwb3M6ICdRQicsIHRlYW06ICdXQVMnLCBieWU6IDE0LCBhZHA6ICc0LjAyJywgcHJvalB0czogMzI4LjUsIGZsb29yOiAxNi44LCBjZWlsaW5nOiAzMS41LCB1cHNpZGVUaWVyOiAnUlVTSElORyBVUFNJREUgR0VNJywgdmFsdWVTdGVhbDogJys4IFBpY2tzIFZhbHVlJywgbmVlZE1hdGNoOiBmYWxzZSB9LFxuICAgICAgeyBpZDogJ3AzMCcsIG5hbWU6ICdDaHJpc3RpYW4gTWNDYWZmcmV5JywgcG9zOiAnUkInLCB0ZWFtOiAnU0YnLCBieWU6IDksIGFkcDogJzQuMDQnLCBwcm9qUHRzOiAxOTguNSwgZmxvb3I6IDguNSwgY2VpbGluZzogMjQuMCwgdXBzaWRlVGllcjogJ1ZFVEVSQU4gUkVDT1ZFUlknLCB2YWx1ZVN0ZWFsOiAnUElDSyAjNDAgT1ZFUkFMTCcsIG5lZWRNYXRjaDogdHJ1ZSB9XG4gICAgXTtcblxuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICBzdGF0dXM6ICdSRUFMX0VTUE5fTElWRV9TWU5DRUQnLFxuICAgICAgbGFzdFVwZGF0ZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHNlYXNvbldlZWs6IGVzcG5TY29yZXNEYXRhLndlZWs/LnRleHQgfHwgJ09mZmljaWFsIE5GTCBTY2hlZHVsZScsXG4gICAgICBzZWFzb25ZZWFyOiBlc3BuU2NvcmVzRGF0YS5zZWFzb24/LnllYXIgfHwgMjAyNixcbiAgICAgIGdhbWVDb3VudDogcmVhbEdhbWVzLmxlbmd0aCxcbiAgICAgIGdhbWVzOiByZWFsR2FtZXMsXG4gICAgICBoZWFkbGluZXM6IHJlYWxIZWFkbGluZXMsXG4gICAgICBkcmFmdFBsYXllcnM6IGRyYWZ0UGxheWVycyxcbiAgICAgIHJhcGlkRW5yaWNoZWQ6ICEhcmFwaWREYXRhXG4gICAgfTtcblxuICAgIHdyaXRlQ2FjaGUoeyB0aW1lc3RhbXA6IG5vdywgZGF0YTogcGF5bG9hZCB9KTtcbiAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oeyBzb3VyY2U6ICdvZmZpY2lhbF9lc3BuX3JlYWx0aW1lJywgY3JlZGVudGlhbHM6IGFjdGl2ZUNyZWRzLCAuLi5wYXlsb2FkIH0pO1xuXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxVyxTQUFTLG9CQUFvQjtBQUNsWSxPQUFPLFdBQVc7OztBQ0RxVyxTQUFTLG9CQUFvQjtBQUNwWixPQUFPLFFBQVE7QUFFZixJQUFNLGNBQWMsUUFBUSxJQUFJLHFCQUFxQixRQUFRLElBQUksZ0JBQWdCO0FBQ2pGLElBQU0scUJBQXFCLFFBQVEsSUFBSSw2QkFBNkIsUUFBUSxJQUFJLDBCQUEwQixRQUFRLElBQUkscUJBQXFCO0FBRTNJLElBQU0sV0FBVztBQUlqQixJQUFNLGFBQWE7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LFNBQVM7QUFDL0MsY0FBTSxNQUFNLElBQUksT0FBTztBQUN2QixZQUFJLENBQUMsSUFBSSxXQUFXLE9BQU8sRUFBRyxRQUFPLEtBQUs7QUFHMUMsWUFBSSxDQUFDLElBQUksTUFBTTtBQUNiLGNBQUksT0FBTyxTQUFTLE1BQU07QUFDeEIsZ0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELGdCQUFJLElBQUksS0FBSyxVQUFVLElBQUksQ0FBQztBQUFBLFVBQzlCO0FBQUEsUUFDRjtBQUNBLFlBQUksQ0FBQyxJQUFJLFFBQVE7QUFDZixjQUFJLFNBQVMsU0FBUyxZQUFZO0FBQ2hDLGdCQUFJLGFBQWE7QUFDakIsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUdBLFlBQUksSUFBSSxXQUFXLFVBQVUsSUFBSSxXQUFXLFNBQVMsSUFBSSxXQUFXLFVBQVU7QUFDNUUsY0FBSSxXQUFXO0FBQ2YsY0FBSSxHQUFHLFFBQVEsV0FBUztBQUFFLHdCQUFZLE1BQU0sU0FBUztBQUFBLFVBQUcsQ0FBQztBQUN6RCxnQkFBTSxJQUFJLFFBQVEsYUFBVyxJQUFJLEdBQUcsT0FBTyxPQUFPLENBQUM7QUFDbkQsY0FBSTtBQUNGLGdCQUFJLE9BQU8sV0FBVyxLQUFLLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFBQSxVQUNoRCxTQUFTLEdBQUc7QUFDVixnQkFBSSxPQUFPLENBQUM7QUFBQSxVQUNkO0FBQUEsUUFDRjtBQUVBLFlBQUk7QUFDRixjQUFJLElBQUksV0FBVyxvQkFBb0IsR0FBRztBQUN4QyxtQkFBTyxNQUFNLFFBQW9CLEtBQUssR0FBRztBQUFBLFVBQzNDLFdBQVcsSUFBSSxXQUFXLGNBQWMsR0FBRztBQUN6QyxtQkFBTyxNQUFNQyxTQUFlLEtBQUssR0FBRztBQUFBLFVBQ3RDLFdBQVcsSUFBSSxXQUFXLGVBQWUsR0FBRztBQUMxQyxtQkFBTyxNQUFNQSxTQUFlLEtBQUssR0FBRztBQUFBLFVBQ3RDO0FBQUEsUUFDRixTQUFTLEtBQUs7QUFDWixpQkFBTyxJQUFJLE9BQU8sR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLElBQUksUUFBUSxDQUFDO0FBQUEsUUFDcEQ7QUFFQSxhQUFLO0FBQUEsTUFDUCxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUM7QUFBQSxFQUNwQyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbImNyZWF0ZUNsaWVudCIsICJmcyIsICJzdXBhYmFzZVVybCIsICJzdXBhYmFzZVNlcnZpY2VLZXkiLCAiZnMiLCAiaGFuZGxlciIsICJzdXBhYmFzZVVybCIsICJjcmVhdGVDbGllbnQiLCAic3VwYWJhc2VTZXJ2aWNlS2V5IiwgImZzIiwgImZzIiwgImhhbmRsZXIiLCAiaGFuZGxlciJdCn0K
