#!/usr/bin/env node

/**
 * PrinterMaster Real Printer Server
 * Discovers and connects to actual system printers
 * QZ-Tray compatible API with real printing capability
 */

const WebSocket = require('ws');
const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

console.log(`
🖨️  PrinterMaster v2.0.0 - Real Printer Server
===============================================
🚀 Starting PrinterMaster with REAL printer support...
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
  restaurant: {
    apiUrl: 'http://localhost:3001/api/v1',
    branchId: null, // Will be set via license
    registrationEndpoint: '/printing/printers/menuhere-register',
    statusEndpoint: '/printing/menuhere/status'
  }
};

// Real printer data (discovered from system)
let printers = [];

// Discover actual system printers
async function discoverPrinters() {
  try {
    console.log('🔍 Discovering real system printers...');
    
    // Use lpstat to get printer list
    const { stdout } = await execAsync('lpstat -p -d');
    const lines = stdout.split('\n');
    
    printers = [];
    
    for (const line of lines) {
      if (line.startsWith('printer ')) {
        const parts = line.split(' ');
        const printerName = parts[1];
        const status = line.includes('idle') ? 'online' : 'offline';
        
        // Determine printer type based on name
        let type = 'thermal';
        let interface = 'usb';
        
        if (printerName.toLowerCase().includes('ricoh') || 
            printerName.toLowerCase().includes('hp') ||
            printerName.toLowerCase().includes('canon')) {
          type = 'laser';
          interface = 'network';
        }
        
        printers.push({
          id: `printer-${printerName.toLowerCase()}`,
          name: printerName,
          status: status,
          type: type,
          interface: interface,
          lastSeen: new Date().toISOString()
        });
      }
    }
    
    console.log(`✅ Discovered ${printers.length} real printers:`, printers.map(p => p.name));
    
    // Auto-register discovered printers with restaurant backend if branch ID is set
    if (CONFIG.restaurant.branchId && printers.length > 0) {
      await registerPrintersWithBackend();
    }
    
  } catch (error) {
    console.error('❌ Error discovering printers:', error.message);
    // Fallback to empty array
    printers = [];
  }
}

// Register discovered printers with restaurant backend
async function registerPrintersWithBackend() {
  if (!CONFIG.restaurant.branchId) {
    console.log('⚠️ No branch ID set - skipping backend registration');
    return;
  }

  console.log('🔄 Registering printers with restaurant backend...');
  
  for (const printer of printers) {
    try {
      const printerData = {
        name: printer.name,
        type: printer.type,
        connection: 'printermaster',
        status: printer.status,
        branchId: CONFIG.restaurant.branchId,
        assignedTo: 'kitchen',
        menuHereId: printer.id,
        ipAddress: '127.0.0.1',
        port: 9012,
        isActive: true,
        capabilities: JSON.stringify(['text', 'cut', 'graphic']),
        manufacturer: 'PrinterMaster',
        model: 'Auto-Detected'
      };

      const axios = require('axios');
      const response = await axios.post(
        `${CONFIG.restaurant.apiUrl}${CONFIG.restaurant.registrationEndpoint}`,
        printerData,
        { timeout: 5000 }
      );

      if (response.data.success) {
        console.log(`✅ Registered printer: ${printer.name}`);
      } else {
        console.log(`⚠️ Registration response: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`⚠️ Failed to register printer ${printer.name}:`, error.message);
    }
  }
}

// License validation and branch setup
async function validateLicense(branchId) {
  try {
    console.log(`🔐 Validating Branch ID (License): ${branchId}`);
    
    const axios = require('axios');
    const response = await axios.post(
      `${CONFIG.restaurant.apiUrl}/printing/license/validate-public`,
      { branchId: branchId },
      { timeout: 10000 }
    );

    if (response.data.success && response.data.valid) {
      CONFIG.restaurant.branchId = branchId;
      console.log(`✅ Branch ID validated successfully`);
      
      // Trigger printer discovery and registration
      await discoverPrinters();
      
      return {
        success: true,
        valid: true,
        message: 'License validated - PrinterMaster connected to restaurant system'
      };
    } else {
      console.log(`❌ Invalid Branch ID: ${response.data.message}`);
      return {
        success: true,
        valid: false,
        message: 'Invalid Branch ID - not found in restaurant system'
      };
    }
  } catch (error) {
    console.error('❌ License validation error:', error.message);
    return {
      success: false,
      valid: false,
      message: `License validation failed: ${error.message}`
    };
  }
}

// Print to actual system printer
async function printToRealPrinter(printerName, data) {
  try {
    console.log(`🖨️ Sending print job to real printer: ${printerName}`);
    console.log(`📄 Content length: ${data.length} characters`);
    
    // Create temporary file with print data
    const fs = require('fs');
    const path = require('path');
    const tempFile = path.join('/tmp', `printermaster-${Date.now()}.txt`);
    
    // Write data to temp file
    fs.writeFileSync(tempFile, data);
    
    // Send to printer using lp command
    const { stdout, stderr } = await execAsync(`lp -d "${printerName}" "${tempFile}"`);
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    if (stderr && !stderr.includes('request id')) {
      throw new Error(stderr);
    }
    
    console.log(`✅ Print job sent successfully to ${printerName}`);
    return {
      success: true,
      jobId: stdout.trim() || Date.now().toString(),
      message: 'Print job completed successfully'
    };
    
  } catch (error) {
    console.error(`❌ Print failed:`, error.message);
    return {
      success: false,
      error: error.message,
      message: 'Print job failed'
    };
  }
}

// Initialize printer discovery
discoverPrinters();

// Refresh printer list every 5 minutes
setInterval(discoverPrinters, 300000);

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
    version: '2.0.0-PrinterMaster-Real',
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received:', data);

      // Handle different API calls (QZ-Tray compatible)
      switch(data.call) {
        case 'printers.find':
          await handlePrinterFind(ws, data);
          break;
        
        case 'printers.getDefault':
          await handleGetDefaultPrinter(ws, data);
          break;

        case 'print.raw':
          await handleRawPrint(ws, data);
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
async function handlePrinterFind(ws, data) {
  console.log('🔍 Finding real printers...');
  
  // Refresh printer list before responding
  await discoverPrinters();
  
  const printerNames = printers.map(p => p.name);
  
  ws.send(JSON.stringify({
    call: data.call,
    result: printerNames,
    callback: data.callback
  }));
  
  console.log(`✅ Found ${printerNames.length} real printers:`, printerNames);
}

async function handleGetDefaultPrinter(ws, data) {
  console.log('🎯 Getting default printer...');
  
  // Get system default printer
  try {
    const { stdout } = await execAsync('lpstat -d');
    let defaultPrinter = null;
    
    if (stdout.includes('system default destination:')) {
      defaultPrinter = stdout.split('system default destination: ')[1].trim();
    } else if (printers.length > 0) {
      // Use first printer if no default set
      defaultPrinter = printers[0].name;
    }
    
    ws.send(JSON.stringify({
      call: data.call,
      result: defaultPrinter,
      callback: data.callback
    }));
    
  } catch (error) {
    ws.send(JSON.stringify({
      call: data.call,
      result: null,
      callback: data.callback
    }));
  }
}

async function handleRawPrint(ws, data) {
  console.log('🖨️ Processing REAL print job...');
  console.log('   Printer:', data.params.printer);
  console.log('   Content preview:', data.params.data.substring(0, 100) + '...');
  
  // Print to actual system printer
  const result = await printToRealPrinter(data.params.printer, data.params.data);
  
  ws.send(JSON.stringify({
    call: data.call,
    result: result.success ? result.message : null,
    error: result.success ? null : result.error,
    jobId: result.jobId || Date.now().toString(),
    callback: data.callback
  }));
  
  if (result.success) {
    console.log('✅ Real print job completed successfully');
  } else {
    console.log('❌ Real print job failed:', result.error);
  }
}

function handleVersion(ws, data) {
  ws.send(JSON.stringify({
    call: data.call,
    result: 'PrinterMaster v2.0.0 - Real Printer Edition',
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
  if (url === '/api/license/validate') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const { branchId } = JSON.parse(body);
          const result = await validateLicense(branchId);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            valid: false,
            message: 'Invalid request: ' + error.message
          }));
        }
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
    return;
  }

  if (url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'PrinterMaster Real',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      websocket: `ws://${CONFIG.websocket.host}:${CONFIG.websocket.port}`,
      printers: printers.length,
      realPrinters: true
    }));
    return;
  }

  if (url === '/api/printers') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      printers: printers,
      total: printers.length,
      online: printers.filter(p => p.status === 'online').length,
      realPrinters: true
    }));
    return;
  }

  if (url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'PrinterMaster Real',
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
      timestamp: new Date().toISOString(),
      realPrinters: true
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
    <title>PrinterMaster Real Printer Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #16a34a; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .real-badge { background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; color: #16a34a; }
        .stat-label { color: #666; margin-top: 5px; }
        .printers { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .printer { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .printer:last-child { border-bottom: none; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.online { background: #10b981; color: white; }
        .status.offline { background: #ef4444; color: white; }
        .test-btn { padding: 8px 16px; background: #16a34a; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .test-btn:hover { background: #15803d; }
        .refresh-btn { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px; }
        .refresh-btn:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖨️ PrinterMaster Real Printer Dashboard <span class="real-badge">REAL PRINTERS</span></h1>
            <p>WebSocket API: ws://localhost:9012 | Branch: Main Branch | Now with ACTUAL printer support!</p>
        </div>
        
        <button class="refresh-btn" onclick="refreshPrinters()">🔄 Refresh Printers</button>
        
        <div class="stats" id="stats">
            <div class="stat-card">
                <div class="stat-value" id="totalPrinters">${printers.length}</div>
                <div class="stat-label">Total Real Printers</div>
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
                <div class="stat-value">🎯</div>
                <div class="stat-label">Real Printing</div>
            </div>
        </div>

        <div class="printers">
            <h3>Real System Printers</h3>
            <div id="printerList">
                ${printers.map(printer => `
                    <div class="printer">
                        <div>
                            <strong>${printer.name}</strong> <span class="real-badge">REAL</span><br>
                            <small>${printer.type} • ${printer.interface}</small>
                        </div>
                        <div>
                            <span class="status ${printer.status}">${printer.status}</span>
                            <button class="test-btn" onclick="testRealPrint('${printer.name}')">🖨️ Test Real Print</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <script>
        function testRealPrint(printerName) {
            console.log('Testing real print to:', printerName);
            
            const ws = new WebSocket('ws://localhost:9012');
            ws.onopen = () => {
                const testContent = 'PrinterMaster REAL Print Test\\n' +
                                  '==============================\\n' +
                                  'Printer: ' + printerName + '\\n' +
                                  'Time: ' + new Date().toLocaleString() + '\\n' +
                                  'Status: This is a REAL print test!\\n' +
                                  '\\n' +
                                  'This should actually print on your\\n' +
                                  'physical printer device.\\n' +
                                  '\\n' +
                                  '✅ PrinterMaster Real Print Test\\n' +
                                  '\\n\\n';
                
                ws.send(JSON.stringify({
                    call: 'print.raw',
                    params: {
                        printer: printerName,
                        data: testContent
                    },
                    callback: 'realPrintCallback'
                }));
                
                ws.onmessage = (event) => {
                    const response = JSON.parse(event.data);
                    if (response.error) {
                        alert('Print failed: ' + response.error);
                    } else {
                        alert('✅ Real print sent to: ' + printerName + '\\nCheck your printer!');
                    }
                    ws.close();
                };
            };
        }
        
        function refreshPrinters() {
            location.reload();
        }
        
        // License validation function
        async function validateBranchId() {
            const branchId = document.getElementById('branchIdInput').value.trim();
            const validateBtn = document.getElementById('validateBtn');
            const messageDiv = document.getElementById('licenseMessage');
            
            if (!branchId) {
                showMessage('Please enter a Branch ID', 'error');
                return;
            }
            
            validateBtn.disabled = true;
            validateBtn.textContent = 'Validating...';
            
            try {
                const response = await fetch('/api/license/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ branchId: branchId })
                });
                
                const result = await response.json();
                
                if (result.success && result.valid) {
                    showMessage('✅ ' + result.message, 'success');
                    setTimeout(() => {
                        location.reload(); // Reload to show connected state
                    }, 1500);
                } else {
                    showMessage('❌ ' + result.message, 'error');
                }
            } catch (error) {
                showMessage('❌ Network error: ' + error.message, 'error');
            } finally {
                validateBtn.disabled = false;
                validateBtn.textContent = 'Validate & Connect';
            }
        }
        
        function showMessage(message, type) {
            const messageDiv = document.getElementById('licenseMessage');
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            messageDiv.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
            messageDiv.style.color = 'white';
        }
        
        // Auto-refresh stats every 10 seconds
        setInterval(() => {
            fetch('/api/status')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('totalPrinters').textContent = data.printers.total;
                    document.getElementById('onlinePrinters').textContent = data.printers.online;
                    document.getElementById('connections').textContent = data.websocket.connections;
                })
                .catch(err => console.error('Stats refresh failed:', err));
        }, 10000);
    </script>
</body>
</html>
    `);
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('PrinterMaster Real API - Route not found');
});

httpServer.listen(CONFIG.http.port, CONFIG.http.host, () => {
  console.log(`🌐 HTTP server started on http://${CONFIG.http.host}:${CONFIG.http.port}`);
});

// Status updates and heartbeat to restaurant backend
setInterval(() => {
  console.log(`📊 Status - WS Connections: ${wss.clients.size} | Real Printers: ${printers.length} (${printers.filter(p => p.status === 'online').length} online)`);
  
  // Send heartbeat to restaurant backend to update printer status
  if (CONFIG.restaurant.branchId) {
    sendHeartbeat();
  }
}, 30000);

// Send heartbeat to restaurant backend
async function sendHeartbeat() {
  try {
    const heartbeatData = {
      branchId: CONFIG.restaurant.branchId,
      printers: printers.map(printer => ({
        name: printer.name,
        status: printer.status,
        lastSeen: new Date().toISOString()
      })),
      timestamp: new Date().toISOString()
    };

    const response = await axios.post(
      `${CONFIG.restaurant.apiUrl}/printing/printers/heartbeat`,
      heartbeatData,
      { timeout: 5000 }
    );

    if (response.data.success) {
      console.log('📡 Heartbeat sent to restaurant backend');
    }
  } catch (error) {
    console.log('⚠️  Heartbeat failed:', error.message);
  }
}

console.log(`
✅ PrinterMaster REAL PRINTER SERVER is running!
===============================================
🌐 Web Dashboard: http://localhost:9013
🔌 WebSocket API: ws://localhost:9012  
📊 Health Check:  http://localhost:9013/api/health
🖨️  Real Printers: ${printers.length} discovered
🎯 ACTUAL printing to physical devices enabled!
===============================================
`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down PrinterMaster Real...');
  process.exit(0);
});