#!/usr/bin/env node

/**
 * Development server script that starts both Next.js and VNC WebSocket server
 */

const { spawn } = require('child_process');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Import VNC WebSocket server
const { VNCWebSocketServer } = require('./src/utils/vnc-websocket-server');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const wsPort = 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Start VNC WebSocket server
  console.log('🚀 Starting VNC WebSocket server...');
  const vncServer = new VNCWebSocketServer(wsPort);

  // Start Next.js server
  console.log('🚀 Starting Next.js development server...');
  
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> VNC WebSocket server running on ws://${hostname}:${wsPort}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      vncServer.close();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      vncServer.close();
      process.exit(0);
    });
  });

}).catch((err) => {
  console.error('Error starting servers:', err);
  process.exit(1);
});