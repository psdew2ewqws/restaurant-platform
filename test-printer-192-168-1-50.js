// Test specific printer at 192.168.1.50
const net = require('net');

async function testPrinter192_168_1_50() {
  console.log('🧪 Testing printer at 192.168.1.50...\n');
  
  const printerIP = '192.168.1.50';
  const testPorts = [9100, 515, 631, 80, 443, 23]; // Common printer ports
  
  console.log(`📡 Testing ${printerIP} on multiple ports:`);
  
  for (const port of testPorts) {
    try {
      const isOpen = await testConnection(printerIP, port, 5000);
      if (isOpen) {
        console.log(`✅ Port ${port} is OPEN on ${printerIP}`);
        
        // Try to get more info about the service
        if (port === 80) {
          console.log(`   🌐 HTTP service detected - likely web management interface`);
          await testHTTPConnection(printerIP, port);
        } else if (port === 9100) {
          console.log(`   🖨️ RAW printing port detected - ESC/POS capable`);
        } else if (port === 515) {
          console.log(`   📄 LPR/LPD service detected - Line Printer Daemon`);
        } else if (port === 631) {
          console.log(`   ☕ IPP service detected - Internet Printing Protocol`);
        }
      } else {
        console.log(`❌ Port ${port} is closed/filtered on ${printerIP}`);
      }
    } catch (error) {
      console.log(`❌ Port ${port} failed on ${printerIP}: ${error.message}`);
    }
  }
  
  // Test basic network connectivity
  console.log(`\n🌐 Testing basic network connectivity to ${printerIP}:`);
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    // Try ping
    try {
      const { stdout } = await execAsync(`ping -c 3 -W 2000 ${printerIP}`);
      if (stdout.includes('3 received')) {
        console.log(`✅ Ping successful - ${printerIP} is reachable on network`);
      } else {
        console.log(`⚠️ Ping partial - some packets lost to ${printerIP}`);
      }
    } catch (pingError) {
      console.log(`❌ Ping failed - ${printerIP} may not be reachable`);
    }
    
    // Try ARP lookup
    try {
      const { stdout } = await execAsync(`arp ${printerIP} 2>/dev/null || echo "No ARP entry"`);
      if (!stdout.includes('No ARP entry')) {
        console.log(`✅ ARP entry found - device exists on local network`);
        console.log(`   ${stdout.trim()}`);
      } else {
        console.log(`❌ No ARP entry - device may not exist or be on different subnet`);
      }
    } catch (arpError) {
      console.log(`⚠️ ARP lookup failed: ${arpError.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Network connectivity test failed: ${error.message}`);
  }
  
  console.log(`\n🔍 Diagnosis for ${printerIP}:`);
  console.log(`   • Check if printer is powered on`);
  console.log(`   • Verify printer is connected to network`);
  console.log(`   • Confirm IP address ${printerIP} is correct`);
  console.log(`   • Check if printer is on same subnet/VLAN`);
  console.log(`   • Try accessing http://${printerIP} in browser if port 80 is open`);
}

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

async function testHTTPConnection(ip, port) {
  try {
    // Try to make a simple HTTP request
    const http = require('http');
    
    const options = {
      hostname: ip,
      port: port,
      path: '/',
      method: 'GET',
      timeout: 3000
    };
    
    return new Promise((resolve) => {
      const req = http.request(options, (res) => {
        console.log(`   📊 HTTP Status: ${res.statusCode} ${res.statusMessage}`);
        console.log(`   🔍 Server: ${res.headers.server || 'Unknown'}`);
        resolve(true);
      });
      
      req.on('error', (error) => {
        console.log(`   ❌ HTTP Error: ${error.message}`);
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.log(`   ⏱️ HTTP Timeout - service may be slow or filtered`);
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
    
  } catch (error) {
    console.log(`   ❌ HTTP test failed: ${error.message}`);
    return false;
  }
}

// Run the test
testPrinter192_168_1_50().catch(console.error);