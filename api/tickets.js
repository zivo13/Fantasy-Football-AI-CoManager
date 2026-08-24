import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

const TMP_TICKETS_FILE = '/tmp/supermacho_tickets_v1.json';

const DEFAULT_SEED_TICKETS = [];

function readTicketsState() {
  try {
    if (fs.existsSync(TMP_TICKETS_FILE)) {
      const raw = fs.readFileSync(TMP_TICKETS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

function saveTicketsState(tickets) {
  try {
    fs.writeFileSync(TMP_TICKETS_FILE, JSON.stringify(tickets));
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let tickets = readTicketsState();

  // GET: Retrieve tickets (All for Admin, or filtered by user_email)
  if (req.method === 'GET') {
    try {
      let filterEmail = null;
      const reqUrl = req.url || '';
      if (reqUrl.includes('user_email=')) {
        const paramStr = reqUrl.split('user_email=')[1];
        if (paramStr) {
          filterEmail = decodeURIComponent(paramStr.split('&')[0]).trim().toLowerCase();
        }
      }

      if (filterEmail) {
        const userTickets = tickets.filter(t => (t.user_email || '').toLowerCase() === filterEmail);
        return res.status(200).json({ tickets: userTickets });
      }

      return res.status(200).json({ tickets });
    } catch (err) {
      return res.status(500).json({ error: err.message, tickets });
    }
  }

  // POST: Create new ticket OR append reply
  if (req.method === 'POST') {
    try {
      const { action, ticketId, user_email, subject, category, priority, message, senderName, senderEmail } = req.body || {};

      if (action === 'reply' && ticketId && message) {
        const ticketIdx = tickets.findIndex(t => t.id === ticketId);
        if (ticketIdx !== -1) {
          const newReply = {
            sender: senderEmail || user_email || 'support@supermacho.app',
            senderName: senderName || 'User',
            text: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
          };
          tickets[ticketIdx].messages.push(newReply);
          tickets[ticketIdx].updated_at = new Date().toISOString();
          saveTicketsState(tickets);

          return res.status(200).json({ success: true, ticket: tickets[ticketIdx], tickets });
        }
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Create new ticket
      if (!user_email || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields (user_email, subject, message)' });
      }

      const newTicket = {
        id: 'tick_' + Date.now(),
        user_email: user_email.trim().toLowerCase(),
        subject: subject.trim(),
        category: category || 'General',
        priority: priority || 'Medium',
        status: 'Open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [
          {
            sender: user_email.trim().toLowerCase(),
            senderName: senderName || user_email.split('@')[0],
            text: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
          }
        ]
      };

      tickets.unshift(newTicket);
      saveTicketsState(tickets);

      // Attempt to save to Supabase if configured
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          await supabase.from('support_tickets').insert([
            {
              user_email: newTicket.user_email,
              subject: newTicket.subject,
              category: newTicket.category,
              priority: newTicket.priority,
              status: newTicket.status,
              messages: newTicket.messages
            }
          ]);
        } catch (e) {}
      }

      return res.status(200).json({ success: true, ticket: newTicket, tickets });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT: Update status or details of a ticket
  if (req.method === 'PUT') {
    try {
      const { ticketId, status, priority, adminReply } = req.body || {};
      if (!ticketId) return res.status(400).json({ error: 'ticketId required' });

      const ticketIdx = tickets.findIndex(t => t.id === ticketId);
      if (ticketIdx !== -1) {
        if (status) tickets[ticketIdx].status = status;
        if (priority) tickets[ticketIdx].priority = priority;

        if (adminReply) {
          tickets[ticketIdx].messages.push({
            sender: 'support@supermacho.app',
            senderName: 'SuperMacho Support Team',
            text: adminReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
          });
        }

        tickets[ticketIdx].updated_at = new Date().toISOString();
        saveTicketsState(tickets);

        return res.status(200).json({ success: true, ticket: tickets[ticketIdx], tickets });
      }
      return res.status(404).json({ error: 'Ticket not found' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE: Remove ticket
  if (req.method === 'DELETE') {
    try {
      const { ticketId } = req.body || {};
      if (ticketId) {
        tickets = tickets.filter(t => t.id !== ticketId);
        saveTicketsState(tickets);
      }
      return res.status(200).json({ success: true, tickets });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
