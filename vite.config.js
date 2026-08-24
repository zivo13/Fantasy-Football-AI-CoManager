import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import registerUserHandler from './api/register-user.js';
import ticketsHandler from './api/tickets.js';
import nflSyncHandler from './api/nfl-sync.js';

function apiServerPlugin() {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) return next();

        // Helper helper to extend res.json if not present
        if (!res.json) {
          res.json = function(data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };
        }
        if (!res.status) {
          res.status = function(statusCode) {
            res.statusCode = statusCode;
            return res;
          };
        }

        // Parse JSON body for POST / PUT / DELETE
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
          let bodyData = '';
          req.on('data', chunk => { bodyData += chunk.toString(); });
          await new Promise(resolve => req.on('end', resolve));
          try {
            req.body = bodyData ? JSON.parse(bodyData) : {};
          } catch (e) {
            req.body = {};
          }
        }

        try {
          if (url.startsWith('/api/register-user')) {
            return await registerUserHandler(req, res);
          } else if (url.startsWith('/api/tickets')) {
            return await ticketsHandler(req, res);
          } else if (url.startsWith('/api/nfl-sync')) {
            return await nflSyncHandler(req, res);
          }
        } catch (err) {
          return res.status(500).json({ error: err.message });
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiServerPlugin()],
  server: {
    port: 3000,
    open: true
  }
});
