#!/usr/bin/env node

/**
 * PrinterMaster Standalone Server
 * Runs the core WebSocket API without Electron GUI
 * Perfect for Ubuntu server environments
 */

const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

console.log(`
🖨️  PrinterMaster v2.0.0 - Standalone Server
===============================================
🚀 Starting PrinterMaster core services...
`);

// Configuration
const CONFIG = {
  websocket: {
    port: 9012,
    host: '0.0.0.0'
  },
  http: {
    port: 9013,
    host: '0.0.0.0'
  },
  branch: {
    id: 'branch-001',
    name: 'Main Branch'
  }
};

// Simulated printer data
let printers = [
  {
    id: 'printer-001',
    name: 'POS Receipt Printer',
    status: 'online',
    type: 'thermal',
    interface: 'usb',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'printer-002', 
    name: 'Kitchen Order Printer',
    status: 'online',
    type: 'thermal',
    interface: 'network',
    lastSeen: new Date().toISOString()
  }
];

// WebSocket Server (QZ-Tray Compatible API)
const wss = new WebSocket.Server({ 
  port: CONFIG.websocket.port,
  host: CONFIG.websocket.host
});

console.log(`🔌 WebSocket server started on ws://${CONFIG.websocket.host}:${CONFIG.websocket.port}`);

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🔗 New WebSocket connection established');

  // Send initial connection response
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    version: '2.0.0-PrinterMaster',
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received:', data);

      // Handle different API calls (QZ-Tray compatible)
      switch(data.call) {
        case 'printers.find':
          handlePrinterFind(ws, data);
          break;
        
        case 'printers.getDefault':
          handleGetDefaultPrinter(ws, data);
          break;

        case 'print.raw':
          handleRawPrint(ws, data);
          break;

        case 'version':
          handleVersion(ws, data);
          break;

        default:
          ws.send(JSON.stringify({
            call: data.call,
            result: null,
            error: 'Unknown API call',
            callback: data.callback
          }));
      }
    } catch (error) {
      console.error('❌ WebSocket message error:', error);
      ws.send(JSON.stringify({
        error: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
  });
});

// API Handlers (QZ-Tray Compatible)
function handlePrinterFind(ws, data) {
  console.log('🔍 Finding printers...');
  
  const printerNames = printers.map(p => p.name);
  
  ws.send(JSON.stringify({
    call: data.call,
    result: printerNames,
    callback: data.callback
  }));
  
  console.log(`✅ Found ${printerNames.length} printers:`, printerNames);
}

function handleGetDefaultPrinter(ws, data) {
  console.log('🎯 Getting default printer...');
  
  const defaultPrinter = printers.find(p => p.id === 'printer-001');
  
  ws.send(JSON.stringify({
    call: data.call,
    result: defaultPrinter ? defaultPrinter.name : null,
    callback: data.callback
  }));
}

function handleRawPrint(ws, data) {
  console.log('🖨️ Processing print job...');
  console.log('   Printer:', data.params.printer);
  console.log('   Content:', data.params.data);
  
  // Simulate printing delay
  setTimeout(() => {
    ws.send(JSON.stringify({
      call: data.call,
      result: 'Print job completed successfully',
      jobId: Date.now().toString(),
      callback: data.callback
    }));
    
    console.log('✅ Print job completed');
  }, 1000);
}

function handleVersion(ws, data) {
  ws.send(JSON.stringify({
    call: data.call,
    result: 'PrinterMaster v2.0.0',
    callback: data.callback
  }));
}

// HTTP Server for Web Dashboard
const httpServer = http.createServer((req, res) => {
  const url = req.url;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'PrinterMaster',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      websocket: `ws://${CONFIG.websocket.host}:${CONFIG.websocket.port}`,
      printers: printers.length
    }));
    return;
  }

  if (url === '/api/printers') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      printers: printers,
      total: printers.length,
      online: printers.filter(p => p.status === 'online').length
    }));
    return;
  }

  if (url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'PrinterMaster',
      status: 'running',
      branch: CONFIG.branch,
      websocket: {
        port: CONFIG.websocket.port,
        connections: wss.clients.size
      },
      printers: {
        total: printers.length,
        online: printers.filter(p => p.status === 'online').length,
        offline: printers.filter(p => p.status === 'offline').length
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Simple HTML Dashboard
  if (url === '/' || url === '/dashboard') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>PrinterMaster Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .stat-label { color: #666; margin-top: 5px; }
        .printers { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .printer { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .printer:last-child { border-bottom: none; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.online { background: #10b981; color: white; }
        .status.offline { background: #ef4444; color: white; }
        .test-btn { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .test-btn:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖨️ PrinterMaster Dashboard</h1>
            <p>WebSocket API: ws://localhost:9012 | Branch: Main Branch</p>
        </div>
        
        <div class="stats" id="stats">
            <div class="stat-card">
                <div class="stat-value" id="totalPrinters">${printers.length}</div>
                <div class="stat-label">Total Printers</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="onlinePrinters">${printers.filter(p => p.status === 'online').length}</div>
                <div class="stat-label">Online</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="connections">${wss.clients.size}</div>
                <div class="stat-label">WS Connections</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">✅</div>
                <div class="stat-label">Service Status</div>
            </div>
        </div>

        <div class="printers">
            <h3>Discovered Printers</h3>
            ${printers.map(printer => `
                <div class="printer">
                    <div>
                        <strong>${printer.name}</strong><br>
                        <small>${printer.type} • ${printer.interface}</small>
                    </div>
                    <div>
                        <span class="status ${printer.status}">${printer.status}</span>
                        <button class="test-btn" onclick="testPrint('${printer.name}')">Test Print</button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        // WebSocket test connection
        function testPrint(printerName) {
            alert('Test print sent to: ' + printerName);
            
            // You can implement actual WebSocket communication here
            const ws = new WebSocket('ws://localhost:9012');
            ws.onopen = () => {
                ws.send(JSON.stringify({
                    call: 'print.raw',
                    params: {
                        printer: printerName,
                        data: 'PrinterMaster Test Print\\n================\\nTest successful!\\n\\n\\n'
                    },
                    callback: 'testPrintCallback'
                }));
            };
        }
        
        // Auto-refresh stats every 5 seconds
        setInterval(() => {
            fetch('/api/status')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('totalPrinters').textContent = data.printers.total;
                    document.getElementById('onlinePrinters').textContent = data.printers.online;
                    document.getElementById('connections').textContent = data.websocket.connections;
                });
        }, 5000);
    </script>
</body>
</html>
    `);
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('PrinterMaster API - Route not found');
});

httpServer.listen(CONFIG.http.port, CONFIG.http.host, () => {
  console.log(`🌐 HTTP server started on http://${CONFIG.http.host}:${CONFIG.http.port}`);
});

// Status updates
setInterval(() => {
  console.log(`📊 Status - WS Connections: ${wss.clients.size} | Printers: ${printers.length} online`);
}, 30000);

console.log(`
✅ PrinterMaster is running!
===============================================
🌐 Web Dashboard: http://localhost:9013
🔌 WebSocket API: ws://localhost:9012  
📊 Health Check:  http://localhost:9013/api/health
🖨️  Ready for restaurant POS integration!
===============================================
`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down PrinterMaster...');
  process.exit(0);
});