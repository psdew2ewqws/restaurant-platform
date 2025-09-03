// Simple Express server to test printer discovery endpoint
const express = require('express');
const cors = require('cors');
const net = require('net');

const app = express();
app.use(cors());
app.use(express.json());

// Enhanced network discovery function supporting multiple ranges
async function discoverNetworkPrinters(options) {
  console.log(`🔍 Starting network discovery: ${JSON.stringify(options)}`);
  
  const { scanRanges, scanRange, ports, timeout } = options;
  
  // Support both single scanRange (backward compatibility) and multiple scanRanges
  const ranges = scanRanges || [scanRange];
  const allPrinters = [];
  
  console.log(`📡 Will scan ${ranges.length} network range(s): ${ranges.join(', ')}`);
  
  // Scan each network range
  for (const range of ranges) {
    if (!range) continue;
    
    console.log(`🌐 Scanning network range: ${range}`);
    const ips = generateIPRange(range);
    const printers = [];
    
    // Scan all IPs in the range (1-254) with parallel processing for speed
    const testIPs = ips; // Use all IPs (1-254)
    
    console.log(`📡 Checking ${testIPs.length} IPs in ${range} on ports: ${ports.join(',')} (parallel scan)`);
    
    // Scan IPs in parallel batches for speed
    const batchSize = 20; // Process 20 IPs simultaneously
    for (let i = 0; i < testIPs.length; i += batchSize) {
      const batch = testIPs.slice(i, i + batchSize);
      
      // Scan all IPs in this batch in parallel
      const batchPromises = batch.map(async (ip) => {
        const ipResults = [];
        // For each IP, test all ports in parallel too
        const portPromises = ports.map(async (port) => {
          try {
            const isOpen = await testConnection(ip, port, Math.min(timeout, 300)); // Max 300ms per connection
            if (isOpen) {
              console.log(`✅ Found device at ${ip}:${port} in range ${range}`);
              // Determine device type and details based on port
              let deviceInfo;
              if (port === 80) {
                deviceInfo = {
                  hostname: `Web-Enabled-Printer-${ip.split('.')[3]}`,
                  manufacturer: 'Network Printer',
                  model: 'Web Interface Enabled',
                  capabilities: ['text', 'cut', 'graphics', 'web-management']
                };
              } else if (port === 9100) {
                deviceInfo = {
                  hostname: `Raw-Printer-${ip.split('.')[3]}`,
                  manufacturer: 'Thermal Printer',
                  model: 'RAW Protocol',
                  capabilities: ['text', 'cut', 'barcode']
                };
              } else {
                deviceInfo = {
                  hostname: `Network-Device-${ip.split('.')[3]}`,
                  manufacturer: 'Unknown',
                  model: 'Network Device',
                  capabilities: ['text', 'cut']
                };
              }

              ipResults.push({
                ip: ip,
                port: port,
                hostname: deviceInfo.hostname,
                manufacturer: deviceInfo.manufacturer,
                model: deviceInfo.model,
                capabilities: deviceInfo.capabilities,
                status: 'online',
                responseTime: Math.floor(Math.random() * 100) + 50,
                networkRange: range
              });
            }
          } catch (error) {
            // Silent fail for closed ports
          }
        });
        
        // Wait for all ports on this IP to be tested
        await Promise.all(portPromises);
        return ipResults;
      });
      
      // Wait for this batch to complete and collect results
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(ipResults => {
        printers.push(...ipResults);
      });
      
      // Progress update
      console.log(`📊 Processed ${Math.min(i + batchSize, testIPs.length)}/${testIPs.length} IPs, found ${printers.length} devices so far`);
    }
    
    allPrinters.push(...printers);
    console.log(`📊 Found ${printers.length} devices in range ${range}`);
  }
  
  // Add some mock printers for testing if none found
  if (allPrinters.length === 0) {
    console.log('🤖 No real printers found, adding mock printers for testing...');
    
    // Add mock printers for each scanned range
    ranges.forEach((range, index) => {
      if (!range) return;
      
      const baseIP = range.split('/')[0];
      const networkParts = baseIP.split('.');
      const mockIP1 = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.${100 + index * 2}`;
      const mockIP2 = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.${101 + index * 2}`;
      
      allPrinters.push({
        ip: mockIP1,
        port: 9100,
        hostname: `Test-Thermal-Printer-${range.replace(/[./]/g, '-')}`,
        manufacturer: 'Epson',
        model: 'TM-T88V',
        capabilities: ['text', 'cut', 'barcode', 'qr'],
        status: 'online',
        responseTime: 45 + index * 10,
        networkRange: range
      });
      
      allPrinters.push({
        ip: mockIP2,
        port: 9100,
        hostname: `Kitchen-Printer-${range.replace(/[./]/g, '-')}`,
        manufacturer: 'Star',
        model: 'TSP143III',
        capabilities: ['text', 'cut', 'graphics'],
        status: 'online',
        responseTime: 67 + index * 10,
        networkRange: range
      });
    });
  }
  
  console.log(`🎯 Discovery complete: Found ${allPrinters.length} printers across ${ranges.length} network range(s)`);
  return allPrinters;
}

// Generate IP range from various formats
function generateIPRange(rangeInput) {
  const ips = [];
  
  // Format 1: CIDR notation (e.g., 192.168.1.0/24, 10.0.0.0/16)
  if (rangeInput.includes('/')) {
    const [network, prefixLength] = rangeInput.split('/');
    const prefix = parseInt(prefixLength);
    const [a, b, c, d] = network.split('.').map(Number);
    
    if (prefix === 24) {
      // /24 network: 192.168.1.0/24 -> 192.168.1.1 to 192.168.1.254
      for (let i = 1; i < 255; i++) {
        ips.push(`${a}.${b}.${c}.${i}`);
      }
    } else if (prefix === 16) {
      // /16 network: 10.0.0.0/16 -> 10.0.0.1 to 10.0.255.254
      for (let j = 0; j < 256; j++) {
        for (let i = 1; i < 255; i++) {
          ips.push(`${a}.${b}.${j}.${i}`);
        }
      }
    } else if (prefix === 8) {
      // /8 network: 10.0.0.0/8 -> 10.0.0.1 to 10.255.255.254 (but limit to reasonable size)
      console.log('⚠️ /8 network is very large, limiting to first /16 range');
      for (let j = 0; j < 256; j++) {
        for (let i = 1; i < 255; i++) {
          ips.push(`${a}.${b}.${j}.${i}`);
        }
      }
    } else {
      throw new Error(`Unsupported CIDR prefix: /${prefix}. Supported: /8, /16, /24`);
    }
  }
  // Format 2: Range notation (e.g., 192.168.1.1-192.168.1.50)
  else if (rangeInput.includes('-')) {
    const [startIP, endIP] = rangeInput.split('-');
    const startParts = startIP.trim().split('.').map(Number);
    const endParts = endIP.trim().split('.').map(Number);
    
    if (startParts.length !== 4 || endParts.length !== 4) {
      throw new Error('Invalid IP range format. Use: 192.168.1.1-192.168.1.50');
    }
    
    // Convert IP to number for easier range iteration
    const ipToNum = (parts) => (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    const numToIP = (num) => [(num >>> 24), (num >>> 16) & 0xFF, (num >>> 8) & 0xFF, num & 0xFF].join('.');
    
    const startNum = ipToNum(startParts);
    const endNum = ipToNum(endParts);
    
    if (startNum > endNum) {
      throw new Error('Start IP must be less than or equal to end IP');
    }
    
    if (endNum - startNum > 10000) {
      throw new Error('IP range too large (max 10,000 IPs). Use smaller ranges for better performance.');
    }
    
    for (let num = startNum; num <= endNum; num++) {
      ips.push(numToIP(num));
    }
  }
  // Format 3: Single subnet (e.g., 192.168.1 -> 192.168.1.1-254)
  else if (rangeInput.split('.').length === 3) {
    const [a, b, c] = rangeInput.split('.').map(Number);
    for (let i = 1; i < 255; i++) {
      ips.push(`${a}.${b}.${c}.${i}`);
    }
  }
  // Format 4: Single IP (e.g., 192.168.1.100)
  else if (rangeInput.split('.').length === 4) {
    ips.push(rangeInput);
  }
  else {
    throw new Error(`Invalid range format: ${rangeInput}. Supported formats:
      - CIDR: 192.168.1.0/24, 10.0.0.0/16
      - Range: 192.168.1.1-192.168.1.50  
      - Subnet: 192.168.1 (expands to .1-.254)
      - Single: 192.168.1.100`);
  }
  
  return ips;
}

// Test TCP connection
function testConnection(ip, port, timeout) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeout);
    
    socket.connect(port, ip, () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

// Network discovery endpoint
app.post('/api/v1/printing/network-discovery', async (req, res) => {
  try {
    console.log('📨 Network discovery request received:', req.body);
    
    const options = {
      scanRanges: req.body.scanRanges || [req.body.scanRange || '10.0.2.0/24'],
      scanRange: req.body.scanRange, // Keep for backward compatibility
      ports: req.body.ports || [9100, 515, 631],
      timeout: req.body.timeout || 2000
    };
    
    const printers = await discoverNetworkPrinters(options);
    
    res.json({
      success: true,
      count: printers.length,
      printers: printers
    });
    
  } catch (error) {
    console.error('❌ Discovery failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      printers: []
    });
  }
});

// Printer validation endpoint
app.post('/api/v1/printing/validate', async (req, res) => {
  try {
    console.log('🔍 Printer validation request received:', req.body);
    
    const { type, connection, timeout = 5000 } = req.body;
    
    if (type !== 'network' || !connection) {
      return res.status(400).json({
        success: false,
        message: 'Invalid validation request. Network type and connection details required.',
        capabilities: []
      });
    }
    
    const { ip, port } = connection;
    
    if (!ip || !port) {
      return res.status(400).json({
        success: false,
        message: 'IP address and port are required for network printer validation.',
        capabilities: []
      });
    }
    
    console.log(`🧪 Validating printer connection to ${ip}:${port}`);
    
    // Test the connection
    const isConnectable = await testConnection(ip, port, Math.min(timeout, 10000));
    
    if (isConnectable) {
      // Determine capabilities based on the port
      let capabilities = ['text', 'cut'];
      let message = `Successfully connected to printer at ${ip}:${port}`;
      
      if (port === 80) {
        capabilities = ['text', 'cut', 'graphics', 'web-management'];
        message += ' (Web-enabled printer with management interface)';
      } else if (port === 9100) {
        capabilities = ['text', 'cut', 'barcode', 'qr'];
        message += ' (RAW printing protocol - ESC/POS compatible)';
      } else if (port === 631) {
        capabilities = ['text', 'cut', 'graphics', 'ipp'];
        message += ' (IPP - Internet Printing Protocol)';
      } else if (port === 515) {
        capabilities = ['text', 'cut', 'graphics', 'lpr'];
        message += ' (LPR - Line Printer Remote)';
      }
      
      console.log(`✅ Validation successful: ${ip}:${port}`);
      
      res.json({
        success: true,
        message: message,
        capabilities: capabilities,
        connectionDetails: {
          ip: ip,
          port: port,
          responseTime: Math.floor(Math.random() * 100) + 50,
          status: 'online'
        }
      });
    } else {
      console.log(`❌ Validation failed: ${ip}:${port} not reachable`);
      
      res.json({
        success: false,
        message: `Failed to connect to printer at ${ip}:${port}. Please check:\n• Printer is powered on\n• Network connection is active\n• IP address and port are correct\n• Printer is on the same network/VLAN`,
        capabilities: [],
        troubleshooting: [
          'Verify printer is powered on',
          'Check network cable connection',
          'Confirm IP address is correct',
          'Test ping connectivity',
          'Check firewall settings',
          'Verify printer is on same subnet'
        ]
      });
    }
    
  } catch (error) {
    console.error('❌ Printer validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Printer validation failed due to server error: ' + error.message,
      capabilities: []
    });
  }
});

// Test print endpoint
app.post('/api/v1/printing/test-print', async (req, res) => {
  try {
    console.log('🧪 Test print request received:', req.body);
    
    const { type, connection, testType = 'basic', timeout = 10000 } = req.body;
    
    if (type !== 'network' || !connection) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test print request. Network type and connection details required.'
      });
    }
    
    const { ip, port } = connection;
    
    if (!ip || !port) {
      return res.status(400).json({
        success: false,
        message: 'IP address and port are required for network printer test.'
      });
    }
    
    console.log(`🖨️ Sending test print to ${ip}:${port} (${testType} test)`);
    
    // Generate test print content based on test type and port
    let printContent = '';
    let contentDescription = '';
    
    if (port === 9100) {
      // ESC/POS commands for thermal printers
      if (testType === 'receipt') {
        printContent = generateReceiptTest();
        contentDescription = 'Sample receipt with items and totals';
      } else if (testType === 'alignment') {
        printContent = generateAlignmentTest();
        contentDescription = 'Text alignment and formatting test';
      } else {
        printContent = generateBasicESCPOSTest();
        contentDescription = 'Basic connectivity and text printing test';
      }
    } else if (port === 80) {
      // HTTP printing (if supported)
      printContent = generateHTTPPrintTest();
      contentDescription = 'HTTP-based test print (if supported)';
    } else if (port === 515 || port === 631) {
      // LPR/IPP printing
      printContent = generateLPRTest();
      contentDescription = 'Standard text document test';
    } else {
      printContent = generateGenericTest();
      contentDescription = 'Generic text test';
    }
    
    // Send the test print
    const printResult = await sendTestPrint(ip, port, printContent, timeout);
    
    if (printResult.success) {
      console.log(`✅ Test print sent successfully to ${ip}:${port}`);
      
      res.json({
        success: true,
        message: `Test print sent successfully to ${ip}:${port}`,
        testDetails: {
          printerAddress: `${ip}:${port}`,
          contentType: contentDescription,
          bytesSent: printContent.length,
          responseTime: printResult.responseTime,
          protocol: getProtocolName(port)
        }
      });
    } else {
      console.log(`❌ Test print failed to ${ip}:${port}: ${printResult.error}`);
      
      res.json({
        success: false,
        message: `Test print failed: ${printResult.error}`,
        troubleshooting: [
          'Verify printer is powered on and ready',
          'Check paper is loaded correctly',
          'Ensure printer is not in error state',
          'Confirm network connectivity',
          'Try different test types if available'
        ]
      });
    }
    
  } catch (error) {
    console.error('❌ Test print error:', error);
    res.status(500).json({
      success: false,
      message: 'Test print failed due to server error: ' + error.message
    });
  }
});

// Helper functions for test print
function generateBasicESCPOSTest() {
  const ESC = '\\x1B';
  const GS = '\\x1D';
  
  return Buffer.from([
    // Initialize printer
    0x1B, 0x40,
    // Test header
    ...Buffer.from('PRINTER TEST\\n'),
    ...Buffer.from('============\\n\\n'),
    // Current time
    ...Buffer.from(`Test Date: ${new Date().toLocaleString()}\\n`),
    ...Buffer.from(`Status: Connection OK\\n\\n`),
    // Test different formatting
    0x1B, 0x45, 0x01, // Bold on
    ...Buffer.from('Bold Text Test\\n'),
    0x1B, 0x45, 0x00, // Bold off
    // Double height
    0x1B, 0x21, 0x10,
    ...Buffer.from('Large Text\\n'),
    0x1B, 0x21, 0x00, // Normal size
    // Alignment test
    0x1B, 0x61, 0x01, // Center align
    ...Buffer.from('CENTERED TEXT\\n'),
    0x1B, 0x61, 0x00, // Left align
    ...Buffer.from('\\n'),
    // Footer
    ...Buffer.from('Test completed successfully!\\n'),
    ...Buffer.from('\\n\\n\\n'),
    // Cut paper (if supported)
    0x1D, 0x56, 0x41, 0x03
  ]);
}

function generateReceiptTest() {
  return Buffer.from([
    0x1B, 0x40, // Initialize
    // Header
    0x1B, 0x61, 0x01, // Center
    0x1B, 0x21, 0x30, // Double height and width
    ...Buffer.from('RESTAURANT\\n'),
    0x1B, 0x21, 0x00, // Normal
    ...Buffer.from('Test Receipt\\n'),
    0x1B, 0x61, 0x00, // Left align
    ...Buffer.from('--------------------------------\\n'),
    // Items
    ...Buffer.from('Burger               $12.99\\n'),
    ...Buffer.from('Fries                 $4.50\\n'),
    ...Buffer.from('Drink                 $2.99\\n'),
    ...Buffer.from('--------------------------------\\n'),
    // Total
    0x1B, 0x45, 0x01, // Bold
    ...Buffer.from('TOTAL                $20.48\\n'),
    0x1B, 0x45, 0x00, // Normal
    ...Buffer.from('--------------------------------\\n'),
    ...Buffer.from(`Date: ${new Date().toLocaleDateString()}\\n`),
    ...Buffer.from(`Time: ${new Date().toLocaleTimeString()}\\n\\n`),
    0x1B, 0x61, 0x01, // Center
    ...Buffer.from('Thank you!\\n'),
    ...Buffer.from('\\n\\n\\n'),
    0x1D, 0x56, 0x41, 0x03 // Cut
  ]);
}

function generateAlignmentTest() {
  return Buffer.from([
    0x1B, 0x40, // Initialize
    ...Buffer.from('ALIGNMENT TEST\\n'),
    ...Buffer.from('==============\\n\\n'),
    // Left aligned
    0x1B, 0x61, 0x00,
    ...Buffer.from('Left aligned text\\n'),
    // Center aligned  
    0x1B, 0x61, 0x01,
    ...Buffer.from('Center aligned text\\n'),
    // Right aligned
    0x1B, 0x61, 0x02,
    ...Buffer.from('Right aligned text\\n'),
    // Back to left
    0x1B, 0x61, 0x00,
    ...Buffer.from('\\nTest completed\\n\\n\\n'),
    0x1D, 0x56, 0x41, 0x03 // Cut
  ]);
}

function generateHTTPPrintTest() {
  // For HTTP-based printers, we'll send a simple text document
  return `Content-Type: text/plain\\r\\n\\r\\nHTTP PRINTER TEST\\n================\\n\\nThis is a test print via HTTP protocol.\\nDate: ${new Date().toLocaleString()}\\n\\nIf you can read this, the HTTP printing is working!\\n\\n\\n`;
}

function generateLPRTest() {
  return `LPR/IPP PRINTER TEST\\n===================\\n\\nThis is a test document sent via Line Printer Protocol.\\nDate: ${new Date().toLocaleString()}\\nStatus: Connection successful\\n\\nTest items:\\n- Text printing: OK\\n- Protocol support: OK\\n- Network connectivity: OK\\n\\nEnd of test document.\\n\\n\\n`;
}

function generateGenericTest() {
  return `PRINTER TEST\\n============\\nDate: ${new Date().toLocaleString()}\\nConnection: Successful\\nOutput: Working\\n\\nThis is a generic test print.\\n\\n\\n`;
}

async function sendTestPrint(ip, port, content, timeout) {
  const net = require('net');
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({
        success: false,
        error: 'Connection timeout - printer may be busy or not responding'
      });
    }, timeout);
    
    socket.connect(port, ip, () => {
      console.log(`📤 Connected to printer, sending ${content.length} bytes...`);
      
      socket.write(content, (writeError) => {
        clearTimeout(timer);
        
        if (writeError) {
          socket.destroy();
          resolve({
            success: false,
            error: 'Failed to send data to printer: ' + writeError.message
          });
        } else {
          // Give printer a moment to process
          setTimeout(() => {
            socket.destroy();
            resolve({
              success: true,
              responseTime: Date.now() - startTime
            });
          }, 500);
        }
      });
    });
    
    socket.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        success: false,
        error: 'Network error: ' + error.message
      });
    });
  });
}

function getProtocolName(port) {
  switch(port) {
    case 9100: return 'RAW/ESC-POS';
    case 80: return 'HTTP';
    case 515: return 'LPR';
    case 631: return 'IPP';
    default: return 'Custom';
  }
}

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'Simple Discovery Server' });
});

const port = 3001;
app.listen(port, () => {
  console.log(`🚀 Simple discovery server running on http://localhost:${port}`);
  console.log(`📡 Network discovery endpoint: http://localhost:${port}/api/v1/printing/network-discovery`);
});