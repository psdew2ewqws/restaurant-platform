// Test specific printer at 192.168.22.110
const net = require('net');

async function testSpecificPrinter() {
  console.log('🧪 Testing specific printer at 192.168.22.110...\n');
  
  const printerIP = '192.168.22.110';
  const testPorts = [9100, 515, 631, 80, 443]; // Common printer and web ports
  
  console.log(`📡 Testing ${printerIP} on multiple ports:`);
  
  for (const port of testPorts) {
    try {
      const isOpen = await testConnection(printerIP, port, 3000);
      if (isOpen) {
        console.log(`✅ Port ${port} is OPEN on ${printerIP}`);
      } else {
        console.log(`❌ Port ${port} is closed on ${printerIP}`);
      }
    } catch (error) {
      console.log(`❌ Port ${port} failed on ${printerIP}: ${error.message}`);
    }
  }
  
  // Also test a few IPs around it
  console.log(`\n📡 Testing nearby IPs around ${printerIP}:`);
  for (let i = 108; i <= 112; i++) {
    const testIP = `192.168.22.${i}`;
    try {
      const isOpen = await testConnection(testIP, 9100, 1000);
      if (isOpen) {
        console.log(`✅ Found device at ${testIP}:9100`);
      }
    } catch (error) {
      // Silent fail for closed ports
    }
  }
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

// Run the test
testSpecificPrinter().catch(console.error);