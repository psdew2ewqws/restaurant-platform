// Network information test to understand the current network setup
const { execSync } = require('child_process');
const net = require('net');

async function getNetworkInfo() {
  console.log('🌐 Analyzing network configuration...\n');
  
  try {
    // Get network interfaces
    const interfaces = require('os').networkInterfaces();
    
    console.log('📡 Network Interfaces:');
    Object.entries(interfaces).forEach(([name, configs]) => {
      configs.forEach(config => {
        if (config.family === 'IPv4' && !config.internal) {
          console.log(`  ${name}: ${config.address}/${config.netmask} (${config.mac})`);
          
          // Calculate network range
          const ip = config.address;
          const parts = ip.split('.');
          const networkBase = `${parts[0]}.${parts[1]}.${parts[2]}`;
          console.log(`  Network range: ${networkBase}.0-255`);
        }
      });
    });
    
    // Get route information
    try {
      console.log('\n🔍 Route Information:');
      const routes = execSync('ip route show', { encoding: 'utf8' });
      console.log(routes);
    } catch (e) {
      console.log('Could not get route info (not on Linux)');
    }
    
    // Test connectivity to common network devices
    console.log('\n🧪 Testing common network devices:');
    const commonIPs = [
      '192.168.1.1',   // Common router
      '192.168.0.1',   // Common router
      '10.0.0.1',      // Common router
      '172.16.0.1'     // Common private network
    ];
    
    for (const ip of commonIPs) {
      const reachable = await testPing(ip);
      console.log(`  ${ip}: ${reachable ? '✅ Reachable' : '❌ Not reachable'}`);
    }
    
    // Test for any devices with open ports in common ranges
    console.log('\n🔍 Scanning for any open ports on current network...');
    await testCurrentNetwork();
    
  } catch (error) {
    console.error('Error getting network info:', error);
  }
}

async function testPing(ip) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 1000);
    
    socket.connect(80, ip, () => {  // Test port 80 (common web port)
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

async function testCurrentNetwork() {
  const interfaces = require('os').networkInterfaces();
  
  for (const [name, configs] of Object.entries(interfaces)) {
    for (const config of configs) {
      if (config.family === 'IPv4' && !config.internal) {
        console.log(`\n📡 Testing network: ${config.address} (${name})`);
        
        const parts = config.address.split('.');
        const networkBase = `${parts[0]}.${parts[1]}.${parts[2]}`;
        
        // Test a few IPs in this range
        const testIPs = [
          `${networkBase}.1`,
          `${networkBase}.10`,
          `${networkBase}.100`,
          `${networkBase}.200`,
          `${networkBase}.254`
        ];
        
        const testPorts = [80, 443, 9100, 515, 631, 22, 23]; // Web, HTTPS, Printer ports, SSH, Telnet
        
        for (const ip of testIPs) {
          for (const port of testPorts) {
            const isOpen = await testPort(ip, port, 500);
            if (isOpen) {
              console.log(`  ✅ Found open port: ${ip}:${port}`);
            }
          }
        }
      }
    }
  }
}

function testPort(ip, port, timeout) {
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

// Run the network analysis
getNetworkInfo().catch(console.error);