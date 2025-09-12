#!/usr/bin/env node

/**
 * PrinterMaster License Entry Server
 * Simple interface for entering Branch ID license only
 */

const http = require('http');
const axios = require('axios');

console.log(`
🔑 PrinterMaster License Entry v2.0.0
=====================================
🎯 Simple license entry interface
`);

// Configuration
const CONFIG = {
  http: {
    port: 9014,
    host: '0.0.0.0'
  },
  restaurant: {
    apiUrl: 'http://localhost:3001/api/v1',
    branchId: null
  }
};

// License validation function
async function validateLicense(branchId) {
  try {
    console.log(`🔍 Validating license: ${branchId}`);
    
    const response = await axios.post(
      `${CONFIG.restaurant.apiUrl}/printing/license/validate-public`,
      { branchId: branchId },
      { timeout: 5000 }
    );
    
    if (response.data.valid) {
      console.log(`✅ License valid for branch: ${response.data.branch.name}`);
      CONFIG.restaurant.branchId = branchId;
      
      // Start the real printer server after successful license validation
      const { spawn } = require('child_process');
      const printerServer = spawn('node', ['real-printer-server.js'], {
        stdio: 'inherit',
        detached: true
      });
      
      console.log(`🚀 Starting PrinterMaster printer service...`);
      
      return {
        success: true,
        message: `License activated for ${response.data.branch.name}`,
        branch: response.data.branch
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Invalid license'
      };
    }
  } catch (error) {
    console.error(`❌ License validation failed:`, error.message);
    return {
      success: false,
      message: `Validation failed: ${error.message}`
    };
  }
}

// HTTP Server for License Entry
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

  // Health check
  if (url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'PrinterMaster License',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // License validation endpoint
  if (url === '/api/validate-license' && req.method === 'POST') {
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
          message: 'Invalid request'
        }));
      }
    });
    return;
  }

  // Simple License Entry Interface
  if (url === '/' || url === '/license') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>PrinterMaster License Entry</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        .logo {
            font-size: 48px;
            margin-bottom: 10px;
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
            font-size: 24px;
        }
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
        }
        input[type="text"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .message {
            margin-top: 20px;
            padding: 12px;
            border-radius: 6px;
            font-weight: 500;
        }
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .loading {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #b8daff;
        }
        .help-text {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🖨️</div>
        <h1>PrinterMaster License</h1>
        
        <form id="licenseForm">
            <div class="form-group">
                <label for="branchId">Branch ID License:</label>
                <input 
                    type="text" 
                    id="branchId" 
                    name="branchId" 
                    placeholder="Enter your Branch ID"
                    required
                    pattern="[a-f0-9\\-]{36}"
                >
                <div class="help-text">Enter the Branch ID provided by your restaurant system</div>
            </div>
            
            <button type="submit" class="btn" id="validateBtn">
                Activate License
            </button>
        </form>
        
        <div id="message" style="display: none;"></div>
    </div>

    <script>
        document.getElementById('licenseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const branchId = document.getElementById('branchId').value;
            const messageDiv = document.getElementById('message');
            const validateBtn = document.getElementById('validateBtn');
            
            if (!branchId) {
                showMessage('Please enter a Branch ID', 'error');
                return;
            }
            
            // Show loading
            validateBtn.disabled = true;
            validateBtn.textContent = 'Validating...';
            showMessage('Validating license...', 'loading');
            
            try {
                const response = await fetch('/api/validate-license', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ branchId })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage('✅ ' + result.message + '\\n\\nPrinterMaster is now active and discovering printers...', 'success');
                    
                    // Disable form after success
                    document.getElementById('branchId').disabled = true;
                    validateBtn.textContent = 'License Activated';
                } else {
                    showMessage('❌ ' + result.message, 'error');
                    validateBtn.disabled = false;
                    validateBtn.textContent = 'Activate License';
                }
            } catch (error) {
                showMessage('❌ Connection error: ' + error.message, 'error');
                validateBtn.disabled = false;
                validateBtn.textContent = 'Activate License';
            }
        });
        
        function showMessage(text, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = text;
            messageDiv.className = 'message ' + type;
            messageDiv.style.display = 'block';
        }
    </script>
</body>
</html>
    `);
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('PrinterMaster License Entry - Page not found');
});

httpServer.listen(CONFIG.http.port, CONFIG.http.host, () => {
  console.log(`🌐 License Entry Interface: http://${CONFIG.http.host}:${CONFIG.http.port}`);
  console.log(`📝 Enter your Branch ID to activate PrinterMaster`);
});

console.log(`
✅ PrinterMaster License Entry is ready!
=====================================
🌐 Open: http://localhost:9014
🔑 Enter your Branch ID to activate
🖨️  Printer discovery starts after activation
=====================================
`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down License Entry...');
  process.exit(0);
});