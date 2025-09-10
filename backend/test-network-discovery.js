// Standalone test for network discovery functionality
// This will help us test if the network discovery logic works independently

const net = require('net');

// Simple network scanner to test printer discovery logic
async function testNetworkDiscovery() {
  console.log('🔍 Starting network discovery test...');
  
  const scanRange = '192.168.1.0/24';
  const ports = [9100, 515, 631];
  const timeout = 2000;
  
  const ips = generateIPRange(scanRange);
  console.log(`📡 Scanning ${ips.length} IPs on ports: ${ports.join(', ')}`);
  
  const foundDevices = [];
  
  // Test first 10 IPs for speed
  const testIPs = ips.slice(0, 10);
  
  for (const ip of testIPs) {
    console.log(`🌐 Scanning ${ip}...`);
    
    for (const port of ports) {
      try {
        const isOpen = await testConnection(ip, port, timeout);
        if (isOpen) {
          console.log(`✅ Found open port: ${ip}:${port}`);
          foundDevices.push({ ip, port, responseTime: timeout });
        }
      } catch (error) {
        // Silent fail for closed ports
      }
    }
  }
  
  console.log(`🎯 Discovery complete! Found ${foundDevices.length} devices:`);
  foundDevices.forEach(device => {
    console.log(`  - ${device.ip}:${device.port}`);
  });
  
  return foundDevices;
}

// Generate IP range from CIDR notation
function generateIPRange(cidr) {
  const [network, prefixLength] = cidr.split('/');
  const prefix = parseInt(prefixLength);
  const [a, b, c, d] = network.split('.').map(Number);
  
  if (prefix !== 24) {
    throw new Error('Only /24 networks supported in this test');
  }
  
  const ips = [];
  for (let i = 1; i < 255; i++) {
    ips.push(`${a}.${b}.${c}.${i}`);
  }
  
  return ips;
}

// Test TCP connection to IP:port
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
testNetworkDiscovery().catch(console.error);